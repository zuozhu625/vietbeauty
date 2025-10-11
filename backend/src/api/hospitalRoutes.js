import express from 'express';
import { models } from '../models/index.js';
import { Op } from 'sequelize';

const router = express.Router();
const { Hospital } = models;

// 获取医院列表
router.get('/', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status = 'active',
      city,
      type,
      level,
      search,
      sort = 'rating',
      order = 'DESC'
    } = req.query;

    const offset = (page - 1) * limit;
    const where = { status };

    if (city) where.city = city;
    if (type) where.type = type;
    if (level) where.level = level;
    if (search) {
      where[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { description: { [Op.like]: `%${search}%` } }
      ];
    }

    const { count, rows } = await Hospital.findAndCountAll({
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
    console.error('获取医院列表失败:', error);
    res.status(500).json({
      success: false,
      message: '获取医院列表失败',
      error: error.message
    });
  }
});

// 获取单个医院
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const hospital = await Hospital.findByPk(id);

    if (!hospital) {
      return res.status(404).json({
        success: false,
        message: '医院不存在'
      });
    }

    res.json({
      success: true,
      data: hospital
    });
  } catch (error) {
    console.error('获取医院失败:', error);
    res.status(500).json({
      success: false,
      message: '获取医院失败',
      error: error.message
    });
  }
});

export default router;
