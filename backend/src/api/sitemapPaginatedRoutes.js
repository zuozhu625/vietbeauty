import express from 'express';
import { models } from '../models/index.js';
import { Op } from 'sequelize';

const router = express.Router();
const { Knowledge, UserShare, Hospital } = models;

// 获取分页知识问答数据（用于sitemap）
router.get('/knowledge', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 5000,
      status = 'published'
    } = req.query;

    const offset = (page - 1) * limit;

    const { count, rows } = await Knowledge.findAndCountAll({
      where: { status },
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['updated_at', 'DESC']],
      attributes: ['id', 'question', 'updated_at', 'created_at', 'view_count']
    });

    const totalPages = Math.ceil(count / limit);
    const hasNextPage = page < totalPages;

    res.json({
      success: true,
      data: rows,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages,
        hasNextPage
      }
    });
  } catch (error) {
    console.error('获取知识问答分页数据失败:', error);
    res.status(500).json({
      success: false,
      message: '获取知识问答分页数据失败',
      error: error.message
    });
  }
});

// 获取分页用户分享数据（用于sitemap）
router.get('/sharing', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 5000,
      status = 'published'
    } = req.query;

    const offset = (page - 1) * limit;

    const { count, rows } = await UserShare.findAndCountAll({
      where: { status },
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['updated_at', 'DESC']],
      attributes: ['id', 'title', 'updated_at', 'created_at', 'view_count']
    });

    const totalPages = Math.ceil(count / limit);
    const hasNextPage = page < totalPages;

    res.json({
      success: true,
      data: rows,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages,
        hasNextPage
      }
    });
  } catch (error) {
    console.error('获取用户分享分页数据失败:', error);
    res.status(500).json({
      success: false,
      message: '获取用户分享分页数据失败',
      error: error.message
    });
  }
});

// 获取分页医院数据（用于sitemap）
router.get('/hospitals', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 5000,
      status = 'active'
    } = req.query;

    const offset = (page - 1) * limit;

    const { count, rows } = await Hospital.findAndCountAll({
      where: { status },
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['updated_at', 'DESC']],
      attributes: ['id', 'name', 'updated_at', 'created_at', 'rating']
    });

    const totalPages = Math.ceil(count / limit);
    const hasNextPage = page < totalPages;

    res.json({
      success: true,
      data: rows,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages,
        hasNextPage
      }
    });
  } catch (error) {
    console.error('获取医院分页数据失败:', error);
    res.status(500).json({
      success: false,
      message: '获取医院分页数据失败',
      error: error.message
    });
  }
});

// 获取所有内容的统计信息（用于动态sitemap索引）
router.get('/stats', async (req, res) => {
  try {
    // 并行获取所有统计信息
    const [knowledgeStats, sharingStats, hospitalStats] = await Promise.all([
      Knowledge.findAndCountAll({
        where: { status: 'published' },
        attributes: ['id']
      }),
      UserShare.findAndCountAll({
        where: { status: 'published' },
        attributes: ['id']
      }),
      Hospital.findAndCountAll({
        where: { status: 'active' },
        attributes: ['id']
      })
    ]);

    const stats = {
      knowledge: {
        total: knowledgeStats.count,
        sitemaps: Math.ceil(knowledgeStats.count / 5000) || 1
      },
      sharing: {
        total: sharingStats.count,
        sitemaps: Math.ceil(sharingStats.count / 5000) || 1
      },
      hospitals: {
        total: hospitalStats.count,
        sitemaps: Math.ceil(hospitalStats.count / 5000) || 1
      }
    };

    // 计算总计
    const totalItems = stats.knowledge.total + stats.sharing.total + stats.hospitals.total;
    const totalSitemaps = stats.knowledge.sitemaps + stats.sharing.sitemaps + stats.hospitals.sitemaps + 1; // +1 为静态页面

    res.json({
      success: true,
      data: stats,
      summary: {
        totalItems,
        totalSitemaps
      }
    });
  } catch (error) {
    console.error('获取统计信息失败:', error);
    res.status(500).json({
      success: false,
      message: '获取统计信息失败',
      error: error.message
    });
  }
});

export default router;
