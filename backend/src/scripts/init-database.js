import { sequelize, models } from '../models/index.js';
import { logger } from '../utils/logger.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 确保数据目录存在
const dataDir = path.join(__dirname, '../../data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// 确保日志目录存在
const logDir = path.join(__dirname, '../../logs');
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

async function initDatabase() {
  try {
    logger.info('开始初始化数据库...');

    // 测试连接
    await sequelize.authenticate();
    logger.info('✅ 数据库连接成功');

    // 同步所有模型
    await sequelize.sync({ force: false });
    logger.info('✅ 数据库表结构同步完成');

    // 插入示例数据
    await insertSampleData();
    logger.info('✅ 示例数据插入完成');

    logger.info('🎉 数据库初始化完成');
  } catch (error) {
    logger.error('❌ 数据库初始化失败:', error);
    throw error;
  } finally {
    await sequelize.close();
  }
}

async function insertSampleData() {
  const { UserShare, Knowledge, Hospital, Service, Contact } = models;

  // 检查是否已有数据
  const userShareCount = await UserShare.count();
  if (userShareCount > 0) {
    logger.info('数据库已有数据，跳过示例数据插入');
    return;
  }

  // 插入用户分享示例数据
  await UserShare.bulkCreate([
    {
      title: 'Phẫu thuật mũi tại TP.HCM - Trải nghiệm tuyệt vời',
      content: 'Tôi đã phẫu thuật mũi tại Bệnh viện thẩm mỹ TP.HCM và rất hài lòng với kết quả. Bác sĩ rất chuyên nghiệp, quy trình an toàn và hiệu quả vượt mong đợi.',
      author_name: 'Chị Lý',
      surgery_type: 'Phẫu thuật mũi',
      hospital_name: 'Bệnh viện thẩm mỹ TP.HCM',
      rating: 5,
      tags: ['mũi', 'thẩm mỹ', 'TP.HCM'],
      status: 'published'
    },
    {
      title: 'Phẫu thuật mắt hai mí - Kết quả tự nhiên',
      content: 'Phẫu thuật mắt hai mí tại Trung tâm phẫu thuật thẩm mỹ quốc tế Hà Nội. Kết quả rất tự nhiên, không ai nhận ra tôi đã phẫu thuật.',
      author_name: 'Anh Vương',
      surgery_type: 'Phẫu thuật mắt',
      hospital_name: 'Trung tâm phẫu thuật thẩm mỹ quốc tế Hà Nội',
      rating: 5,
      tags: ['mắt', 'hai mí', 'Hà Nội'],
      status: 'published'
    }
  ]);

  // 插入知识问答示例数据
  await Knowledge.bulkCreate([
    {
      question: 'Phẫu thuật mũi cần bao lâu để phục hồi?',
      answer: 'Nhìn chung, phẫu thuật mũi cần 1-2 tuần để phục hồi ban đầu, hoàn toàn phục hồi cần 3-6 tháng. Thời gian phục hồi phụ thuộc vào loại phẫu thuật và cơ địa của từng người.',
      category: 'Phẫu thuật mũi',
      doctor_name: 'Bác sĩ phẫu thuật thẩm mỹ',
      doctor_title: 'Chuyên gia phẫu thuật thẩm mỹ',
      difficulty_level: 'beginner',
      status: 'published'
    },
    {
      question: 'Phẫu thuật mắt hai mí có những cách nào?',
      answer: 'Chủ yếu có phương pháp cắt mí, phương pháp rạch và phương pháp ba điểm kiểu Hàn, mỗi phương pháp phù hợp với điều kiện mắt khác nhau.',
      category: 'Phẫu thuật mắt',
      doctor_name: 'Chuyên gia phẫu thuật mắt',
      doctor_title: 'Bác sĩ chuyên khoa mắt',
      difficulty_level: 'intermediate',
      status: 'published'
    }
  ]);

  // 插入医院示例数据
  await Hospital.bulkCreate([
    {
      name: 'Bệnh viện thẩm mỹ TP.HCM',
      description: 'Bệnh viện thẩm mỹ hàng đầu tại TP.HCM với đội ngũ bác sĩ chuyên nghiệp và thiết bị hiện đại.',
      address: '123 Nguyễn Huệ, Quận 1, TP.HCM',
      city: 'TP.HCM',
      district: 'Quận 1',
      phone: '+84-28-1234-5678',
      email: 'info@hospital-hcm.com',
      rating: 4.8,
      review_count: 1234,
      specialties: ['Phẫu thuật mũi', 'Phẫu thuật mắt', 'Tạo hình cơ thể'],
      level: 'A',
      type: 'private',
      status: 'active'
    },
    {
      name: 'Trung tâm phẫu thuật thẩm mỹ quốc tế Hà Nội',
      description: 'Trung tâm phẫu thuật thẩm mỹ quốc tế với công nghệ tiên tiến và dịch vụ chuyên nghiệp.',
      address: '456 Lê Lợi, Quận Hoàn Kiếm, Hà Nội',
      city: 'Hà Nội',
      district: 'Quận Hoàn Kiếm',
      phone: '+84-24-8765-4321',
      email: 'info@hospital-hanoi.com',
      rating: 4.9,
      review_count: 856,
      specialties: ['Phẫu thuật mắt', 'Làm đẹp da', 'Chống lão hóa'],
      level: 'A',
      type: 'international',
      status: 'active'
    }
  ]);

  // 插入服务示例数据
  await Service.bulkCreate([
    {
      name: 'Nâng mũi bằng silicone',
      description: 'Sử dụng vật liệu silicone nhập khẩu, thiết kế mũi lý tưởng theo tỷ lệ khuôn mặt.',
      category: 'Phẫu thuật mũi',
      price_min: 2000,
      price_max: 4000,
      currency: 'USD',
      duration: '1-2 giờ',
      recovery_time: '1-2 tuần',
      difficulty_level: 'intermediate',
      is_popular: true,
      status: 'active'
    },
    {
      name: 'Tạo hình mắt hai mí',
      description: 'Sử dụng phương pháp cắt mí hoặc rạch, tạo ra mắt hai mí tự nhiên và quyến rũ.',
      category: 'Phẫu thuật mắt',
      price_min: 800,
      price_max: 2500,
      currency: 'USD',
      duration: '30 phút-1 giờ',
      recovery_time: '1-2 tuần',
      difficulty_level: 'beginner',
      is_recommended: true,
      status: 'active'
    }
  ]);

  logger.info('✅ 示例数据插入完成');
}

// 运行初始化
initDatabase().catch(console.error);
