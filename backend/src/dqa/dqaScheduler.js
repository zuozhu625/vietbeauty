import cron from 'node-cron';
import { models } from '../models/index.js';
import { logger } from '../utils/logger.js';
import dqaGenerator from './dqaGenerator.js';

const { Knowledge } = models;

/**
 * DQA定时任务调度器
 * 负责自动生成并发布医院问答内容
 */
class DQAScheduler {
  constructor() {
    this.isRunning = false;
    this.scheduledTask = null;
    this.stats = {
      total_generated: 0,
      total_success: 0,
      total_failed: 0,
      last_run: null,
      next_run: null
    };
  }

  /**
   * 启动定时任务 - 每15分钟执行一次
   */
  start() {
    if (this.isRunning) {
      logger.warn('DQA定时任务已在运行中');
      return;
    }

    try {
      // Cron表达式: */15 * * * * = 每15分钟执行一次
      this.scheduledTask = cron.schedule('*/15 * * * *', async () => {
        await this.executeScheduledTask();
      });

      this.isRunning = true;
      this.updateNextRunTime();
      logger.info('✅ DQA定时任务启动成功 - 每15分钟生成一条医院问答');
      logger.info(`📅 下次执行时间: ${this.stats.next_run}`);
    } catch (error) {
      logger.error('启动DQA定时任务失败:', error);
      throw error;
    }
  }

  /**
   * 停止定时任务
   */
  stop() {
    if (this.scheduledTask) {
      this.scheduledTask.stop();
      this.isRunning = false;
      logger.info('⏹️ DQA定时任务已停止');
    }
  }

  /**
   * 执行定时任务
   */
  async executeScheduledTask() {
    try {
      logger.info('⏰ 执行定时DQA生成任务...');
      this.stats.last_run = new Date().toISOString();
      this.stats.total_generated++;

      // 生成一条DQA
      const dqaData = await dqaGenerator.generateBatchDQA(1);
      
      if (!dqaData || dqaData.length === 0) {
        throw new Error('生成DQA失败：无数据返回');
      }

      const dqa = dqaData[0];

      // 保存到数据库
      const knowledge = await Knowledge.create({
        question: dqa.question,
        answer: dqa.answer,
        category: dqa.category,
        subcategory: dqa.subcategory,
        hospital_name: dqa.hospital_name,
        doctor_name: dqa.doctor_name,
        doctor_title: dqa.doctor_title,
        tags: dqa.tags,
        difficulty_level: dqa.difficulty_level,
        status: 'published', // 自动发布
        source: 'api', // 标记为自动生成
        external_id: `dqa_auto_${Date.now()}`,
        like_count: 0,
        view_count: 0
      });

      this.stats.total_success++;
      this.updateNextRunTime();

      logger.info(`✅ DQA自动生成成功 [ID: ${knowledge.id}]`);
      logger.info(`   问题: ${dqa.question.substring(0, 50)}...`);
      logger.info(`   医院: ${dqa.hospital_name}`);
      logger.info(`   分类: ${dqa.category} > ${dqa.subcategory}`);
      logger.info(`   标签: ${dqa.tags.join(', ')}`);
      logger.info(`📅 下次执行: ${this.stats.next_run}`);

      return {
        success: true,
        knowledge_id: knowledge.id,
        question: dqa.question,
        hospital_name: dqa.hospital_name
      };

    } catch (error) {
      this.stats.total_failed++;
      this.updateNextRunTime();
      logger.error('定时DQA生成失败:', error);
      
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * 更新下次运行时间
   */
  updateNextRunTime() {
    const now = new Date();
    const minutes = now.getMinutes();
    const nextMinutes = Math.ceil((minutes + 1) / 15) * 15;
    const nextRun = new Date(now);
    
    if (nextMinutes >= 60) {
      nextRun.setHours(now.getHours() + 1);
      nextRun.setMinutes(0);
    } else {
      nextRun.setMinutes(nextMinutes);
    }
    nextRun.setSeconds(0);
    
    this.stats.next_run = nextRun.toISOString();
  }

  /**
   * 手动执行一次（用于测试）
   */
  async executeOnce() {
    logger.info('🔧 手动执行DQA生成任务...');
    return await this.executeScheduledTask();
  }

  /**
   * 获取统计信息
   */
  getStats() {
    return {
      is_running: this.isRunning,
      ...this.stats,
      success_rate: this.stats.total_generated > 0 
        ? `${((this.stats.total_success / this.stats.total_generated) * 100).toFixed(2)}%`
        : 'N/A'
    };
  }

  /**
   * 重置统计信息
   */
  resetStats() {
    this.stats = {
      total_generated: 0,
      total_success: 0,
      total_failed: 0,
      last_run: null,
      next_run: this.stats.next_run
    };
    logger.info('统计信息已重置');
  }

  /**
   * 批量生成DQA（一次性生成多条）
   * @param {number} count 生成数量
   */
  async batchGenerate(count = 10) {
    try {
      logger.info(`📦 开始批量生成 ${count} 条DQA...`);
      
      const dqaDataList = await dqaGenerator.generateBatchDQA(count);
      const results = {
        total: count,
        success: 0,
        failed: 0,
        created: []
      };

      for (const dqaData of dqaDataList) {
        try {
          const knowledge = await Knowledge.create({
            question: dqaData.question,
            answer: dqaData.answer,
            category: dqaData.category,
            subcategory: dqaData.subcategory,
            hospital_name: dqaData.hospital_name,
            doctor_name: dqaData.doctor_name,
            doctor_title: dqaData.doctor_title,
            tags: dqaData.tags,
            difficulty_level: dqaData.difficulty_level,
            status: 'published',
            source: 'api',
            external_id: `dqa_batch_${Date.now()}_${results.success}`,
            like_count: 0,
            view_count: 0
          });

          results.success++;
          results.created.push({
            id: knowledge.id,
            question: dqaData.question.substring(0, 80),
            hospital: dqaData.hospital_name
          });

          logger.info(`✅ [${results.success}/${count}] 创建成功: ${dqaData.question.substring(0, 50)}...`);
        } catch (error) {
          results.failed++;
          logger.error(`❌ 创建失败:`, error.message);
        }
      }

      logger.info(`📊 批量生成完成: 成功 ${results.success}, 失败 ${results.failed}`);
      return results;

    } catch (error) {
      logger.error('批量生成DQA失败:', error);
      throw error;
    }
  }
}

export default new DQAScheduler();

