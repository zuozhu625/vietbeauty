#!/usr/bin/env node
/**
 * 复制越南语数据到前端数据库
 * 从 medical.db 复制医院、用户分享等越南语数据到 database.sqlite
 */

import sqlite3 from 'sqlite3';
import { promisify } from 'util';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const sourcePath = path.join(__dirname, '../../../backend/data/medical.db');
const targetPath = path.join(__dirname, '../../../backend/data/database.sqlite');

async function copyData() {
  console.log('🔄 开始复制越南语数据...\n');
  
  // 打开源数据库
  const sourceDb = new sqlite3.Database(sourcePath);
  const sourceRun = promisify(sourceDb.run.bind(sourceDb));
  const sourceAll = promisify(sourceDb.all.bind(sourceDb));
  
  // 打开目标数据库
  const targetDb = new sqlite3.Database(targetPath);
  const targetRun = promisify(targetDb.run.bind(targetDb));
  
  try {
    // 1. 复制医院数据
    console.log('📋 复制医院数据...');
    const hospitals = await sourceAll('SELECT * FROM hospitals');
    
    // 创建表
    await targetRun(`
      CREATE TABLE IF NOT EXISTS hospitals (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name VARCHAR(200) NOT NULL,
        description TEXT,
        address VARCHAR(500),
        city VARCHAR(100),
        district VARCHAR(100),
        phone VARCHAR(50),
        email VARCHAR(100),
        website VARCHAR(500),
        logo_url VARCHAR(500),
        rating DECIMAL(3,2),
        review_count INTEGER DEFAULT 0,
        images JSON,
        specialties JSON,
        services JSON,
        facilities JSON,
        certifications JSON,
        level VARCHAR(10),
        type VARCHAR(50),
        status VARCHAR(20) DEFAULT 'active',
        established_year INTEGER,
        doctors_count INTEGER,
        beds_count INTEGER,
        data_source VARCHAR(50) DEFAULT 'manual',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // 插入数据
    for (const hospital of hospitals) {
      const columns = Object.keys(hospital).join(', ');
      const placeholders = Object.keys(hospital).map(() => '?').join(', ');
      const values = Object.values(hospital);
      await targetRun(`INSERT INTO hospitals (${columns}) VALUES (${placeholders})`, values);
    }
    console.log(`✅ 已复制 ${hospitals.length} 家医院\n`);
    
    // 2. 复制用户分享数据
    console.log('📋 复制用户分享数据...');
    const userShares = await sourceAll('SELECT * FROM user_shares');
    
    await targetRun(`
      CREATE TABLE IF NOT EXISTS user_shares (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title VARCHAR(200) NOT NULL,
        content TEXT NOT NULL,
        author_name VARCHAR(100),
        author_age INTEGER,
        author_avatar VARCHAR(500),
        surgery_type VARCHAR(100),
        hospital_name VARCHAR(200),
        rating INTEGER,
        images JSON,
        tags JSON,
        view_count INTEGER DEFAULT 0,
        like_count INTEGER DEFAULT 0,
        status VARCHAR(20) DEFAULT 'published',
        source VARCHAR(50) DEFAULT 'manual',
        external_id VARCHAR(100),
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    for (const share of userShares) {
      const columns = Object.keys(share).join(', ');
      const placeholders = Object.keys(share).map(() => '?').join(', ');
      const values = Object.values(share);
      await targetRun(`INSERT INTO user_shares (${columns}) VALUES (${placeholders})`, values);
    }
    console.log(`✅ 已复制 ${userShares.length} 条用户分享\n`);
    
    // 3. 创建空的 knowledge 表（供 DQA 使用）
    console.log('📋 创建知识问答表...');
    await targetRun(`
      CREATE TABLE IF NOT EXISTS knowledge (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        question VARCHAR(500) NOT NULL,
        answer TEXT NOT NULL,
        category VARCHAR(100) DEFAULT 'Tư vấn chung',
        subcategory VARCHAR(100),
        doctor_name VARCHAR(100),
        doctor_title VARCHAR(100),
        doctor_avatar VARCHAR(500),
        hospital_name VARCHAR(200),
        like_count INTEGER DEFAULT 0,
        view_count INTEGER DEFAULT 0,
        tags JSON,
        difficulty_level VARCHAR(20) DEFAULT 'beginner',
        status VARCHAR(20) DEFAULT 'published',
        source VARCHAR(20) DEFAULT 'manual',
        external_id VARCHAR(100),
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // 只复制越南语问答（如果有）
    const vietnameseKnowledge = await sourceAll(`
      SELECT * FROM knowledge 
      WHERE question LIKE '%ệ%' OR question LIKE '%ư%' OR question LIKE '%ơ%' OR question LIKE '%ă%'
    `);
    
    for (const knowledge of vietnameseKnowledge) {
      const columns = Object.keys(knowledge).join(', ');
      const placeholders = Object.keys(knowledge).map(() => '?').join(', ');
      const values = Object.values(knowledge);
      await targetRun(`INSERT INTO knowledge (${columns}) VALUES (${placeholders})`, values);
    }
    console.log(`✅ 已复制 ${vietnameseKnowledge.length} 条越南语问答\n`);
    
    // 4. 复制其他表
    const services = await sourceAll('SELECT * FROM services');
    const contacts = await sourceAll('SELECT * FROM contacts');
    
    await targetRun(`
      CREATE TABLE IF NOT EXISTS services (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name VARCHAR(200) NOT NULL,
        description TEXT,
        category VARCHAR(100),
        price_range VARCHAR(100),
        duration VARCHAR(50),
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    await targetRun(`
      CREATE TABLE IF NOT EXISTS contacts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name VARCHAR(100) NOT NULL,
        phone VARCHAR(50),
        email VARCHAR(100),
        message TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    for (const service of services) {
      const columns = Object.keys(service).join(', ');
      const placeholders = Object.keys(service).map(() => '?').join(', ');
      const values = Object.values(service);
      await targetRun(`INSERT INTO services (${columns}) VALUES (${placeholders})`, values);
    }
    
    for (const contact of contacts) {
      const columns = Object.keys(contact).join(', ');
      const placeholders = Object.keys(contact).map(() => '?').join(', ');
      const values = Object.values(contact);
      await targetRun(`INSERT INTO contacts (${columns}) VALUES (${placeholders})`, values);
    }
    
    console.log(`✅ 已复制 ${services.length} 条服务`);
    console.log(`✅ 已复制 ${contacts.length} 条联系信息\n`);
    
    console.log('✅ 数据复制完成！\n');
    console.log('📊 database.sqlite 数据统计:');
    console.log(`  - 医院: ${hospitals.length} 条`);
    console.log(`  - 用户分享: ${userShares.length} 条`);
    console.log(`  - 知识问答: ${vietnameseKnowledge.length} 条`);
    console.log(`  - 服务: ${services.length} 条`);
    console.log(`  - 联系: ${contacts.length} 条`);
    
  } catch (error) {
    console.error('❌ 复制失败:', error);
    process.exit(1);
  } finally {
    sourceDb.close();
    targetDb.close();
  }
}

copyData();

