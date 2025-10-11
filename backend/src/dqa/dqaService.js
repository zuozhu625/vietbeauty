import { logger } from '../utils/logger.js';
import hospitalDataExtractor from './hospitalDataExtractor.js';
import chainHospitalEnhancer from './chainHospitalEnhancer.js';
import dqaGenerator from './dqaGenerator.js';
import dqaScheduler from './dqaScheduler.js';

/**
 * DQA服务主控制器
 * 统一管理所有DQA相关功能
 */
class DQAService {
  /**
   * 初始化DQA服务
   */
  async initialize() {
    try {
      logger.info('🚀 初始化DQA服务...');
      
      // 启动定时任务
      dqaScheduler.start();
      
      logger.info('✅ DQA服务初始化完成');
      return { success: true, message: 'DQA服务启动成功' };
    } catch (error) {
      logger.error('初始化DQA服务失败:', error);
      throw error;
    }
  }

  /**
   * 关闭DQA服务
   */
  shutdown() {
    try {
      logger.info('⏹️ 关闭DQA服务...');
      dqaScheduler.stop();
      logger.info('✅ DQA服务已关闭');
    } catch (error) {
      logger.error('关闭DQA服务失败:', error);
    }
  }

  /**
   * 获取医院清单
   */
  async getHospitalList() {
    try {
      const summary = await hospitalDataExtractor.generateHospitalSummary();
      const distribution = await hospitalDataExtractor.getCityDistribution();
      
      return {
        success: true,
        total: summary.length,
        hospitals: summary,
        city_distribution: distribution
      };
    } catch (error) {
      logger.error('获取医院清单失败:', error);
      throw error;
    }
  }

  /**
   * 分析连锁医院
   */
  async analyzeChainHospitals() {
    try {
      const analysis = await chainHospitalEnhancer.analyzeAndEnhanceChainHospitals();
      return {
        success: true,
        ...analysis
      };
    } catch (error) {
      logger.error('分析连锁医院失败:', error);
      throw error;
    }
  }

  /**
   * 获取连锁医院补充建议
   */
  async getChainEnhancementSuggestions() {
    try {
      return await chainHospitalEnhancer.getEnhancementSuggestions();
    } catch (error) {
      logger.error('获取连锁医院建议失败:', error);
      throw error;
    }
  }

  /**
   * 自动补充连锁医院
   */
  async autoEnhanceChainHospitals(maxCount = 10) {
    try {
      return await chainHospitalEnhancer.autoEnhanceChainHospitals(maxCount);
    } catch (error) {
      logger.error('自动补充连锁医院失败:', error);
      throw error;
    }
  }

  /**
   * 手动生成DQA
   */
  async generateDQA(count = 1) {
    try {
      if (count === 1) {
        return await dqaScheduler.executeOnce();
      } else {
        return await dqaScheduler.batchGenerate(count);
      }
    } catch (error) {
      logger.error('生成DQA失败:', error);
      throw error;
    }
  }

  /**
   * 获取DQA统计信息
   */
  getStats() {
    return dqaScheduler.getStats();
  }

  /**
   * 控制定时任务
   */
  controlScheduler(action) {
    switch (action) {
      case 'start':
        dqaScheduler.start();
        return { success: true, message: '定时任务已启动' };
      case 'stop':
        dqaScheduler.stop();
        return { success: true, message: '定时任务已停止' };
      case 'restart':
        dqaScheduler.stop();
        dqaScheduler.start();
        return { success: true, message: '定时任务已重启' };
      default:
        throw new Error(`无效的操作: ${action}`);
    }
  }
}

export default new DQAService();

