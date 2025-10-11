import express from 'express';
import { models } from '../models/index.js';
import Joi from 'joi';
import { Op } from 'sequelize';

const router = express.Router();
const { UserShare } = models;

// 验证模式
const createUserShareSchema = Joi.object({
  title: Joi.string().max(200).required(),
  content: Joi.string().required(),
  author_name: Joi.string().max(100).required(),
  author_avatar: Joi.string().uri().optional(),
  surgery_type: Joi.string().max(100).optional(),
  hospital_name: Joi.string().max(200).optional(),
  rating: Joi.number().integer().min(1).max(5).optional(),
  images: Joi.array().items(Joi.string().uri()).optional(),
  tags: Joi.array().items(Joi.string()).optional(),
  source: Joi.string().valid('n8n', 'manual', 'api').default('manual'),
  external_id: Joi.string().max(100).optional()
});

const updateUserShareSchema = Joi.object({
  title: Joi.string().max(200).optional(),
  content: Joi.string().optional(),
  author_name: Joi.string().max(100).optional(),
  author_avatar: Joi.string().uri().optional(),
  surgery_type: Joi.string().max(100).optional(),
  hospital_name: Joi.string().max(200).optional(),
  rating: Joi.number().integer().min(1).max(5).optional(),
  images: Joi.array().items(Joi.string().uri()).optional(),
  tags: Joi.array().items(Joi.string()).optional(),
  status: Joi.string().valid('draft', 'published', 'archived').optional()
});

// n8n专用简化验证模式
const n8nUserShareSchema = Joi.object({
  title: Joi.string().max(200).required(),
  content: Joi.string().required()
});

// 获取用户分享列表
router.get('/', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status = 'published',
      surgery_type,
      hospital_name,
      search,
      sort = 'created_at',
      order = 'DESC'
    } = req.query;

    const offset = (page - 1) * limit;
    const where = { status };

    // 添加筛选条件
    if (surgery_type) where.surgery_type = surgery_type;
    if (hospital_name) where.hospital_name = hospital_name;
    if (search) {
      where[Op.or] = [
        { title: { [Op.like]: `%${search}%` } },
        { content: { [Op.like]: `%${search}%` } },
        { author_name: { [Op.like]: `%${search}%` } }
      ];
    }

    const { count, rows } = await UserShare.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [[sort, order.toUpperCase()]]
    });

    res.json({
      success: true,
      data: rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count,
        pages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    console.error('获取用户分享列表失败:', error);
    res.status(500).json({
      success: false,
      message: '获取用户分享列表失败',
      error: error.message
    });
  }
});

// 获取单个用户分享
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const userShare = await UserShare.findByPk(id);

    if (!userShare) {
      return res.status(404).json({
        success: false,
        message: '用户分享不存在'
      });
    }

    // 增加浏览次数
    await userShare.increment('view_count');

    res.json({
      success: true,
      data: userShare
    });
  } catch (error) {
    console.error('获取用户分享失败:', error);
    res.status(500).json({
      success: false,
      message: '获取用户分享失败',
      error: error.message
    });
  }
});

// 创建用户分享
router.post('/', async (req, res) => {
  try {
    const { error, value } = createUserShareSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: '数据验证失败',
        errors: error.details
      });
    }

    const userShare = await UserShare.create(value);

    res.status(201).json({
      success: true,
      message: '用户分享创建成功',
      data: userShare
    });
  } catch (error) {
    console.error('创建用户分享失败:', error);
    res.status(500).json({
      success: false,
      message: '创建用户分享失败',
      error: error.message
    });
  }
});

// 更新用户分享
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { error, value } = updateUserShareSchema.validate(req.body);
    
    if (error) {
      return res.status(400).json({
        success: false,
        message: '数据验证失败',
        errors: error.details
      });
    }

    const userShare = await UserShare.findByPk(id);
    if (!userShare) {
      return res.status(404).json({
        success: false,
        message: '用户分享不存在'
      });
    }

    await userShare.update(value);

    res.json({
      success: true,
      message: '用户分享更新成功',
      data: userShare
    });
  } catch (error) {
    console.error('更新用户分享失败:', error);
    res.status(500).json({
      success: false,
      message: '更新用户分享失败',
      error: error.message
    });
  }
});

// 删除用户分享
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const userShare = await UserShare.findByPk(id);

    if (!userShare) {
      return res.status(404).json({
        success: false,
        message: '用户分享不存在'
      });
    }

    await userShare.destroy();

    res.json({
      success: true,
      message: '用户分享删除成功'
    });
  } catch (error) {
    console.error('删除用户分享失败:', error);
    res.status(500).json({
      success: false,
      message: '删除用户分享失败',
      error: error.message
    });
  }
});

// 点赞用户分享
router.post('/:id/like', async (req, res) => {
  try {
    const { id } = req.params;
    const userShare = await UserShare.findByPk(id);

    if (!userShare) {
      return res.status(404).json({
        success: false,
        message: '用户分享不存在'
      });
    }

    await userShare.increment('like_count');

    res.json({
      success: true,
      message: '点赞成功',
      data: { like_count: userShare.like_count + 1 }
    });
  } catch (error) {
    console.error('点赞失败:', error);
    res.status(500).json({
      success: false,
      message: '点赞失败',
      error: error.message
    });
  }
});

// 智能分类函数 - 根据标题和内容判断分类（优化版）
function intelligentClassify(title, content) {
  const text = (title + ' ' + content).toLowerCase();
  
  // 定义分类关键词（按优先级排序，具体的分类在前）
  const categories = {
    // 优先匹配：手术类（更具体）
    'Phẫu thuật mũi': [
      'phẫu thuật mũi', 'nâng mũi', 'sụn mũi', 'mũi cao', 
      'thu gọn cánh mũi', 'nâng mũi s line', 'sửa mũi', 
      'chỉnh sửa mũi', 'nâng mũi sụn sườn', 'nâng mũi cấu trúc'
    ],
    'Phẫu thuật mắt': [
      'phẫu thuật mắt', 'cắt mí', 'bấm mí', 'mí mắt', 
      'nhấn mí', 'mở rộng mắt', 'chữa sụp mí', 'mắt to', 
      'mở khóe mắt', 'cắt bọng mắt'
    ],
    'Đường nét khuôn mặt': [
      'gọt mặt', 'v-line', 'phẫu thuật hàm', 'xương quai hàm', 
      'gọt cằm', 'độn cằm', 'thon gọn hàm', 'phẫu thuật má'
    ],
    // 身体美容细分
    'Nâng ngực': [
      'nâng ngực', 'phẫu thuật ngực', 'ngực đẹp', 'túi ngực', 
      'độn ngực', 'nâng vòng 1', 'phẫu thuật vòng 1', 'silicone ngực',
      'implant ngực', 'nâng ngực nội soi'
    ],
    'Hút mỡ tạo hình': [
      'hút mỡ', 'giảm béo', 'tạo hình cơ thể', 'vòng eo', 
      'body', 'nâng mông', 'thu gọn bụng', 'giảm mỡ bụng',
      'hút mỡ bụng', 'hút mỡ đùi', 'săn chắc cơ thể'
    ],
    // 后匹配：非手术类（关键词较广）
    'Làm đẹp da': [
      'botox', 'filler', 'tiêm botox', 'tiêm filler', 
      'laser', 'peel da', 'trẻ hóa da', 'trắng da', 
      'căng da', 'collagen', 'chăm sóc da', 'làm đẹp da',
      'trị nám', 'trị mụn', 'skincare'
    ]
  };
  
  // 优先匹配长关键词（更精确）
  // 遍历分类，查找匹配的关键词
  for (const [category, keywords] of Object.entries(categories)) {
    // 按关键词长度排序，长的优先（更精确）
    const sortedKeywords = keywords.sort((a, b) => b.length - a.length);
    for (const keyword of sortedKeywords) {
      if (text.includes(keyword)) {
        return category;
      }
    }
  }
  
  // 如果没有匹配到，返回默认分类
  return 'Chia sẻ chung';
}

// n8n专用接口 - 只接收title和content
router.post('/n8n', async (req, res) => {
  try {
    // 验证请求数据
    const { error, value } = n8nUserShareSchema.validate(req.body);
    
    if (error) {
      return res.status(400).json({
        success: false,
        message: '数据验证失败',
        errors: error.details.map(detail => ({
          message: detail.message,
          path: detail.path,
          type: detail.type,
          context: detail.context
        }))
      });
    }

    const { title, content } = value;

    // 智能识别分类
    const surgeryType = intelligentClassify(title, content);

    // 创建用户分享记录，使用默认值填充其他字段
    const userShare = await UserShare.create({
      title,
      content,
      author_name: 'Người dùng ẩn danh', // 默认作者名（匿名用户）
      author_age: 25, // 默认年龄
      surgery_type: surgeryType, // 智能识别的分类
      hospital_name: 'Bệnh viện thẩm mỹ', // 默认医院
      doctor_name: 'Bác sĩ chuyên khoa', // 默认医生
      surgery_date: new Date(), // 当前日期
      recovery_time: '1-3 tháng', // 默认恢复时间
      cost_range: 'Liên hệ để biết giá', // 默认费用
      recovery_status: 'Đang phục hồi', // 默认状态
      rating: 5, // 默认评分
      like_count: 0,
      view_count: 0,
      comment_count: 0,
      status: 'published', // 直接发布
      source: 'n8n', // 标记来源
      external_id: `n8n_${Date.now()}` // 生成外部ID
    });

    res.status(201).json({
      success: true,
      message: '用户分享创建成功',
      data: {
        id: userShare.id,
        title: userShare.title,
        content: userShare.content,
        created_at: userShare.created_at
      }
    });
  } catch (error) {
    console.error('创建n8n用户分享失败:', error);
    res.status(500).json({
      success: false,
      message: '创建用户分享失败',
      error: error.message
    });
  }
});

export default router;
