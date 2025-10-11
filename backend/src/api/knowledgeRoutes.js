import express from 'express';
import { models } from '../models/index.js';
import Joi from 'joi';
import { Op } from 'sequelize';

const router = express.Router();
const { Knowledge } = models;

// 验证模式
const createKnowledgeSchema = Joi.object({
  question: Joi.string().max(500).required(),
  answer: Joi.string().required(),
  category: Joi.string().max(100).optional().default('Tư vấn chung'),
  subcategory: Joi.string().max(100).optional(),
  doctor_name: Joi.string().max(100).optional().default('Bác sĩ chuyên khoa'),
  doctor_title: Joi.string().max(100).optional(),
  doctor_avatar: Joi.string().uri().optional(),
  hospital_name: Joi.string().max(200).optional(),
  tags: Joi.array().items(Joi.string()).optional(),
  difficulty_level: Joi.string().valid('beginner', 'intermediate', 'advanced').default('beginner'),
  source: Joi.string().valid('n8n', 'manual', 'api').default('manual'),
  external_id: Joi.string().max(100).optional()
});

// 获取知识问答列表
router.get('/', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status = 'published',
      category,
      subcategory,
      difficulty_level,
      search,
      sort = 'created_at',
      order = 'DESC'
    } = req.query;

    const offset = (page - 1) * limit;
    const where = { status };

    if (category) where.category = category;
    if (subcategory) where.subcategory = subcategory;
    if (difficulty_level) where.difficulty_level = difficulty_level;
    if (search) {
      where[Op.or] = [
        { question: { [Op.like]: `%${search}%` } },
        { answer: { [Op.like]: `%${search}%` } }
      ];
    }

    const { count, rows } = await Knowledge.findAndCountAll({
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
    console.error('获取知识问答列表失败:', error);
    res.status(500).json({
      success: false,
      message: '获取知识问答列表失败',
      error: error.message
    });
  }
});

// 获取单个知识问答
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const knowledge = await Knowledge.findByPk(id);

    if (!knowledge) {
      return res.status(404).json({
        success: false,
        message: '知识问答不存在'
      });
    }

    await knowledge.increment('view_count');

    res.json({
      success: true,
      data: knowledge
    });
  } catch (error) {
    console.error('获取知识问答失败:', error);
    res.status(500).json({
      success: false,
      message: '获取知识问答失败',
      error: error.message
    });
  }
});

// 创建知识问答
router.post('/', async (req, res) => {
  try {
    const { error, value } = createKnowledgeSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: '数据验证失败',
        errors: error.details
      });
    }

    const knowledge = await Knowledge.create(value);

    res.status(201).json({
      success: true,
      message: '知识问答创建成功',
      data: knowledge
    });
  } catch (error) {
    console.error('创建知识问答失败:', error);
    res.status(500).json({
      success: false,
      message: '创建知识问答失败',
      error: error.message
    });
  }
});

// 点赞知识问答
router.post('/:id/like', async (req, res) => {
  try {
    const { id } = req.params;
    const knowledge = await Knowledge.findByPk(id);

    if (!knowledge) {
      return res.status(404).json({
        success: false,
        message: '知识问答不存在'
      });
    }

    await knowledge.increment('like_count');

    res.json({
      success: true,
      message: '点赞成功',
      data: { like_count: knowledge.like_count + 1 }
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

// n8n专用接口 - 知识问答模块专门接口
const n8nKnowledgeSchema = Joi.object({
  question: Joi.string().max(500).required(),
  answer: Joi.string().required(),
  category: Joi.string().max(100).optional().default('Tư vấn chung'),
  doctor_name: Joi.string().max(100).optional().default('Bác sĩ chuyên khoa')
});

router.post('/n8n', async (req, res) => {
  try {
    // 验证请求数据
    const { error, value } = n8nKnowledgeSchema.validate(req.body);
    
    if (error) {
      return res.status(400).json({
        success: false,
        message: '数据验证失败',
        errors: error.details.map(detail => ({
          message: detail.message,
          path: detail.path,
          type: detail.type
        }))
      });
    }

    const { question, answer, category, doctor_name } = value;

    // 创建知识问答记录
    const knowledge = await Knowledge.create({
      question,
      answer,
      category,
      doctor_name,
      like_count: 0,
      view_count: 0,
      status: 'published', // 直接发布
      source: 'n8n', // 标记来源
      external_id: `n8n_knowledge_${Date.now()}` // 生成外部ID
    });

    res.status(201).json({
      success: true,
      message: '知识问答创建成功',
      data: {
        id: knowledge.id,
        question: knowledge.question,
        answer: knowledge.answer,
        category: knowledge.category,
        doctor_name: knowledge.doctor_name,
        created_at: knowledge.created_at
      }
    });
  } catch (error) {
    console.error('创建n8n知识问答失败:', error);
    res.status(500).json({
      success: false,
      message: '创建知识问答失败',
      error: error.message
    });
  }
});

export default router;
