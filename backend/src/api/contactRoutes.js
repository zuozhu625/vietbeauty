import express from 'express';
import { models } from '../models/index.js';
import Joi from 'joi';

const router = express.Router();
const { Contact } = models;

// 验证模式
const createContactSchema = Joi.object({
  name: Joi.string().max(100).required(),
  email: Joi.string().email().max(100).required(),
  phone: Joi.string().max(50).optional(),
  subject: Joi.string().max(200).required(),
  message: Joi.string().required(),
  inquiry_type: Joi.string().valid('consultation', 'appointment', 'general', 'complaint', 'suggestion').default('general'),
  preferred_contact: Joi.string().valid('email', 'phone', 'wechat', 'whatsapp').default('email'),
  hospital_interest: Joi.string().max(200).optional(),
  service_interest: Joi.string().max(200).optional(),
  budget_range: Joi.string().max(100).optional(),
  timeline: Joi.string().max(100).optional(),
  source: Joi.string().valid('website', 'n8n', 'api', 'manual').default('website')
});

// 创建联系记录
router.post('/', async (req, res) => {
  try {
    const { error, value } = createContactSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: '数据验证失败',
        errors: error.details
      });
    }

    const contact = await Contact.create(value);

    res.status(201).json({
      success: true,
      message: '联系记录创建成功',
      data: contact
    });
  } catch (error) {
    console.error('创建联系记录失败:', error);
    res.status(500).json({
      success: false,
      message: '创建联系记录失败',
      error: error.message
    });
  }
});

// 获取联系记录列表 (管理员)
router.get('/', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      priority,
      inquiry_type,
      assigned_to,
      sort = 'created_at',
      order = 'DESC'
    } = req.query;

    const offset = (page - 1) * limit;
    const where = {};

    if (status) where.status = status;
    if (priority) where.priority = priority;
    if (inquiry_type) where.inquiry_type = inquiry_type;
    if (assigned_to) where.assigned_to = assigned_to;

    const { count, rows } = await Contact.findAndCountAll({
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
    console.error('获取联系记录列表失败:', error);
    res.status(500).json({
      success: false,
      message: '获取联系记录列表失败',
      error: error.message
    });
  }
});

// 更新联系记录状态
router.put('/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, response, assigned_to } = req.body;

    const contact = await Contact.findByPk(id);
    if (!contact) {
      return res.status(404).json({
        success: false,
        message: '联系记录不存在'
      });
    }

    const updateData = { status };
    if (response) updateData.response = response;
    if (assigned_to) updateData.assigned_to = assigned_to;
    if (response) updateData.response_date = new Date();

    await contact.update(updateData);

    res.json({
      success: true,
      message: '联系记录状态更新成功',
      data: contact
    });
  } catch (error) {
    console.error('更新联系记录状态失败:', error);
    res.status(500).json({
      success: false,
      message: '更新联系记录状态失败',
      error: error.message
    });
  }
});

export default router;
