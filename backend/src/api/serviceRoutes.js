import express from 'express';
import { models } from '../models/index.js';
import { Op } from 'sequelize';

const router = express.Router();
const { Service } = models;

// 获取服务列表
router.get('/', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status = 'active',
      category,
      subcategory,
      difficulty_level,
      is_popular,
      is_recommended,
      search,
      sort = 'created_at',
      order = 'DESC'
    } = req.query;

    const offset = (page - 1) * limit;
    const where = { status };

    if (category) where.category = category;
    if (subcategory) where.subcategory = subcategory;
    if (difficulty_level) where.difficulty_level = difficulty_level;
    if (is_popular !== undefined) where.is_popular = is_popular === 'true';
    if (is_recommended !== undefined) where.is_recommended = is_recommended === 'true';
    if (search) {
      where[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { description: { [Op.like]: `%${search}%` } }
      ];
    }

    const { count, rows } = await Service.findAndCountAll({
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
    console.error('获取服务列表失败:', error);
    res.status(500).json({
      success: false,
      message: '获取服务列表失败',
      error: error.message
    });
  }
});

// 获取单个服务
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const service = await Service.findByPk(id);

    if (!service) {
      return res.status(404).json({
        success: false,
        message: '服务不存在'
      });
    }

    res.json({
      success: true,
      data: service
    });
  } catch (error) {
    console.error('获取服务失败:', error);
    res.status(500).json({
      success: false,
      message: '获取服务失败',
      error: error.message
    });
  }
});

export default router;
