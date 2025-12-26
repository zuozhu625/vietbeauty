#!/usr/bin/env node
/**
 * DQA批量生成500条脚本
 */

import { fileURLToPath } from 'url';
import path from 'path';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 动态导入DQA生成器
const dqaGeneratorPath = path.join(__dirname, '../dqa/dqaGenerator.js');
const dqaGeneratorModule = await import(dqaGeneratorPath);
const dqaGenerator = dqaGeneratorModule.default;

console.log('\n========================================================');
console.log('🚀 开始批量生成500条DQA问答');
console.log('========================================================\n');

const startTime = Date.now();

// 导入models以保存到数据库
const modelsPath = path.join(__dirname, '../models/index.js');
const { models } = await import(modelsPath);
const { Knowledge } = models;

try {
  // 使用DQA生成器的内置批量生成方法
  console.log('📝 正在生成500条DQA问答...');
  const dqas = await dqaGenerator.generateBatchDQA(500);
  
  console.log('💾 正在保存到数据库...');
  let savedCount = 0;
  let skipCount = 0;
  
  for (const dqa of dqas) {
    try {
      // 检查是否已存在
      const existing = await Knowledge.findOne({
        where: { question: dqa.question }
      });
      
      if (existing) {
        skipCount++;
        continue;
      }
      
      // 保存到数据库
      await Knowledge.create(dqa);
      savedCount++;
      
      if (savedCount % 50 === 0) {
        console.log(`   已保存: ${savedCount}/${dqas.length}`);
      }
    } catch (error) {
      console.error(`保存失败: ${error.message}`);
    }
  }
  
  const totalTime = ((Date.now() - startTime) / 1000).toFixed(1);
  const avgTime = (totalTime / 500).toFixed(1);
  
  console.log('\n========================================================');
  console.log('🎉 批量生成完成');
  console.log('========================================================');
  console.log(`✅ 成功生成: ${dqas.length}条`);
  console.log(`💾 成功保存: ${savedCount}条`);
  console.log(`⏭️  跳过重复: ${skipCount}条`);
  console.log(`⏱️  总用时: ${totalTime}秒`);
  console.log(`📊 平均速度: ${avgTime}秒/条`);
  console.log('========================================================\n');
  
  // 查询总数
  const total = await Knowledge.count({ where: { source: 'dqa' } });
  console.log(`📈 数据库DQA总数: ${total}条\n`);
  
} catch (error) {
  console.error('❌ 批量生成出错:', error);
  process.exit(1);
}

process.exit(0);

