#!/usr/bin/env node
/**
 * 设置前端数据库并复制越南语数据
 */

import { Sequelize, DataTypes } from 'sequelize';
import sqlite3 from 'sqlite3';
import { promisify } from 'util';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const sourcePath = path.join(__dirname, '../../../backend/data/medical.db');
const targetPath = path.join(__dirname, '../../../backend/data/database.sqlite');

async function setup() {
  console.log('🔄 设置前端数据库...\n');
  
  // 1. 创建目标数据库连接并同步模型
  const targetSeq = new Sequelize({
    dialect: 'sqlite',
    storage: targetPath,
    logging: false
  });
  
  // 导入所有模型
  const { default: UserShareModel } = await import('../models/UserShare.js');
  const { default: KnowledgeModel } = await import('../models/Knowledge.js');
  const { default: HospitalModel } = await import('../models/Hospital.js');
  const { default: ServiceModel } = await import('../models/Service.js');
  const { default: ContactModel } = await import('../models/Contact.js');
  
  const UserShare = UserShareModel(targetSeq);
  const Knowledge = KnowledgeModel(targetSeq);
  const Hospital = HospitalModel(targetSeq);
  const Service = ServiceModel(targetSeq);
  const Contact = ContactModel(targetSeq);
  
  // 同步表结构
  console.log('📋 创建表结构...');
  await targetSeq.sync({ force: true });
  console.log('✅ 表结构创建完成\n');
  
  // 2. 从源数据库复制数据
  const sourceDb = new sqlite3.Database(sourcePath);
  const sourceAll = promisify(sourceDb.all.bind(sourceDb));
  
  try {
    // 复制医院
    console.log('📋 复制医院数据...');
    const hospitals = await sourceAll('SELECT * FROM hospitals');
    for (const h of hospitals) {
      await Hospital.create(h, { raw: true });
    }
    console.log(`✅ 已复制 ${hospitals.length} 家医院\n`);
    
    // 复制用户分享
    console.log('📋 复制用户分享数据...');
    const shares = await sourceAll('SELECT * FROM user_shares');
    for (const s of shares) {
      await UserShare.create(s, { raw: true });
    }
    console.log(`✅ 已复制 ${shares.length} 条用户分享\n`);
    
    // 只复制越南语问答
    console.log('📋 复制越南语问答...');
    const knowledge = await sourceAll(`
      SELECT * FROM knowledge 
      WHERE question LIKE '%ệ%' OR question LIKE '%ư%' OR question LIKE '%ơ%' OR question LIKE '%ă%'
    `);
    for (const k of knowledge) {
      await Knowledge.create(k, { raw: true });
    }
    console.log(`✅ 已复制 ${knowledge.length} 条越南语问答\n`);
    
    // 复制服务
    const services = await sourceAll('SELECT * FROM services');
    for (const srv of services) {
      await Service.create(srv, { raw: true });
    }
    
    // 复制联系
    const contacts = await sourceAll('SELECT * FROM contacts');
    for (const c of contacts) {
      await Contact.create(c, { raw: true });
    }
    
    console.log('✅ 数据复制完成！\n');
    console.log('📊 database.sqlite 数据统计:');
    console.log(`  - 医院: ${hospitals.length} 条`);
    console.log(`  - 用户分享: ${shares.length} 条`);
    console.log(`  - 知识问答: ${knowledge.length} 条`);
    console.log(`  - 服务: ${services.length} 条`);
    console.log(`  - 联系: ${contacts.length} 条`);
    
  } catch (error) {
    console.error('❌ 失败:', error);
    process.exit(1);
  } finally {
    sourceDb.close();
    await targetSeq.close();
  }
}

setup();

