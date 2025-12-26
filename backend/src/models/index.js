import { Sequelize } from 'sequelize';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 数据库连接配置
// database.sqlite: 前端越南语网站数据（医院、用户分享、越南语问答）
// medical.db: 后端中文智能体数据（仅供智能体训练使用）
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: path.join(__dirname, '../../data/database.sqlite'),
  logging: process.env.NODE_ENV === 'development' ? console.log : false,
  define: {
    timestamps: true,
    underscored: true,
  }
});

// 导入模型
import UserShare from './UserShare.js';
import Knowledge from './Knowledge.js';
import Hospital from './Hospital.js';
import Service from './Service.js';
import Contact from './Contact.js';

// 初始化模型
const models = {
  UserShare: UserShare(sequelize),
  Knowledge: Knowledge(sequelize),
  Hospital: Hospital(sequelize),
  Service: Service(sequelize),
  Contact: Contact(sequelize),
};

// 关联关系
Object.keys(models).forEach(modelName => {
  if (models[modelName].associate) {
    models[modelName].associate(models);
  }
});

// 数据库连接测试
const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ 数据库连接成功');
  } catch (error) {
    console.error('❌ 数据库连接失败:', error);
  }
};

export { sequelize, models, testConnection };
