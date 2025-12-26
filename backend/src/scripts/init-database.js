#!/usr/bin/env node
/**
 * 初始化前端网站数据库
 * 用途：为越南语网站创建数据库表结构
 * 注意：这个数据库与 medical.db（中文智能体数据）是分开的
 */

import { sequelize, models } from '../models/index.js';

async function initDatabase() {
  try {
    console.log('🔄 开始初始化前端网站数据库 (database.sqlite)...');
    
    // 测试连接
    await sequelize.authenticate();
    console.log('✅ 数据库连接成功');
    
    // 同步所有模型（创建表）
    await sequelize.sync({ alter: true });
    console.log('✅ 数据库表结构已创建/更新');
    
    // 显示创建的表
    const tableNames = Object.keys(models);
    console.log('\n📊 已创建的数据表:');
    tableNames.forEach(name => {
      console.log(`  - ${models[name].tableName}`);
    });
    
    // 检查现有数据
    const counts = {};
    for (const name of tableNames) {
      const count = await models[name].count();
      counts[name] = count;
    }
    
    console.log('\n📈 当前数据统计:');
    Object.entries(counts).forEach(([name, count]) => {
      console.log(`  - ${name}: ${count} 条`);
    });
    
    console.log('\n✅ 初始化完成！');
    console.log('\n💡 说明:');
    console.log('  - database.sqlite: 前端越南语网站数据');
    console.log('  - medical.db: 后端中文智能体数据（独立）');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ 初始化失败:', error);
    process.exit(1);
  }
}

initDatabase();
