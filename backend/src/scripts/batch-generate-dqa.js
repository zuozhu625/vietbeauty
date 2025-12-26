#!/usr/bin/env node
/**
 * DQA批量生成脚本
 * 功能：批量生成不重复的医院问答
 */

import { fileURLToPath } from 'url';
import path from 'path';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 动态导入DQA生成器
const dqaGeneratorPath = path.join(__dirname, '../dqa/dqaGenerator.js');
const dqaGeneratorModule = await import(dqaGeneratorPath);
const generator = dqaGeneratorModule.default;

// 动态导入models
const modelsPath = path.join(__dirname, '../models/index.js');
const { models } = await import(modelsPath);
const { Knowledge } = models;

/**
 * 批量生成DQA问答
 * @param {number} count - 要生成的数量
 */
async function batchGenerateDQA(count = 500) {
  console.log(''.repeat(60));
  console.log(`🚀 开始批量生成${count}条DQA问答`);
  console.log(''.repeat(60));
  
  // generator已经在顶部导入了，是单例
  const startTime = Date.now();
  let successCount = 0;
  let failCount = 0;
  
  // 用于跟踪已生成的问答，避免重复
  const generatedQuestions = new Set();
  
  for (let i = 0; i < count; i++) {
    try {
      console.log(`\n${'='.repeat(60)}`);
      console.log(`📝 生成进度: ${i + 1}/${count}`);
      console.log('='.repeat(60));
      
      // 生成一个问答
      const qa = await generator.generateRandomQA();
      
      if (qa) {
        // 检查是否重复
        if (generatedQuestions.has(qa.question)) {
          console.log(`⚠️  问题重复，跳过: ${qa.question.substring(0, 50)}...`);
          failCount++;
          continue;
        }
        
        // 检查数据库中是否已存在
        const existing = await Knowledge.findOne({
          where: {
            question: qa.question
          }
        });
        
        if (existing) {
          console.log(`⚠️  数据库中已存在，跳过: ${qa.question.substring(0, 50)}...`);
          failCount++;
          continue;
        }
        
        // 保存到数据库
        await Knowledge.create(qa);
        
        generatedQuestions.add(qa.question);
        successCount++;
        
        console.log(`✅ 成功生成 (${successCount}/${count})`);
        console.log(`   分类: ${qa.category}`);
        console.log(`   问题: ${qa.question.substring(0, 60)}...`);
      } else {
        console.log(`❌ 生成失败 (${i + 1}/${count})`);
        failCount++;
      }
      
      // 每10条显示一次统计
      if ((i + 1) % 10 === 0) {
        const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
        const avgTime = (elapsed / (i + 1)).toFixed(1);
        console.log(`\n📊 阶段统计:`);
        console.log(`   成功: ${successCount}条`);
        console.log(`   失败: ${failCount}条`);
        console.log(`   用时: ${elapsed}秒`);
        console.log(`   平均: ${avgTime}秒/条`);
      }
      
    } catch (error) {
      console.error(`❌ 生成第${i + 1}条时出错:`, error.message);
      failCount++;
    }
  }
  
  // 最终统计
  const totalTime = ((Date.now() - startTime) / 1000).toFixed(1);
  const avgTime = (totalTime / count).toFixed(1);
  
  console.log(`\n${'='.repeat(60)}`);
  console.log('🎉 批量生成完成');
  console.log('='.repeat(60));
  console.log(`✅ 成功: ${successCount}条`);
  console.log(`❌ 失败: ${failCount}条`);
  console.log(`⏱️  总用时: ${totalTime}秒`);
  console.log(`📊 平均速度: ${avgTime}秒/条`);
  console.log('='.repeat(60));
  
  // 查询总数
  const total = await Knowledge.count({
    where: {
      source: 'dqa'
    }
  });
  
  console.log(`\n📈 数据库统计:`);
  console.log(`   DQA问答总数: ${total}条`);
  console.log('='.repeat(60) + '\n');
  
  process.exit(0);
}

// 从命令行参数获取生成数量
const count = parseInt(process.argv[2]) || 500;

console.log(`\n⚙️  参数设置: 生成${count}条问答\n`);

// 开始批量生成
batchGenerateDQA(count).catch(error => {
  console.error('❌ 批量生成出错:', error);
  process.exit(1);
});

