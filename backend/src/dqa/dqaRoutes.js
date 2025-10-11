import express from 'express';
import dqaService from './dqaService.js';
import { logger } from '../utils/logger.js';

const router = express.Router();

/**
 * DQA API路由
 */

// ========== 医院数据相关 ==========

/**
 * 获取医院清单
 * GET /api/dqa/hospitals
 */
router.get('/hospitals', async (req, res) => {
  try {
    const result = await dqaService.getHospitalList();
    res.json(result);
  } catch (error) {
    logger.error('获取医院清单API错误:', error);
    res.status(500).json({
      success: false,
      message: '获取医院清单失败',
      error: error.message
    });
  }
});

/**
 * 分析连锁医院
 * GET /api/dqa/chain-hospitals/analyze
 */
router.get('/chain-hospitals/analyze', async (req, res) => {
  try {
    const result = await dqaService.analyzeChainHospitals();
    res.json(result);
  } catch (error) {
    logger.error('分析连锁医院API错误:', error);
    res.status(500).json({
      success: false,
      message: '分析连锁医院失败',
      error: error.message
    });
  }
});

/**
 * 获取连锁医院补充建议
 * GET /api/dqa/chain-hospitals/suggestions
 */
router.get('/chain-hospitals/suggestions', async (req, res) => {
  try {
    const result = await dqaService.getChainEnhancementSuggestions();
    res.json(result);
  } catch (error) {
    logger.error('获取补充建议API错误:', error);
    res.status(500).json({
      success: false,
      message: '获取补充建议失败',
      error: error.message
    });
  }
});

/**
 * 自动补充连锁医院
 * POST /api/dqa/chain-hospitals/enhance
 */
router.post('/chain-hospitals/enhance', async (req, res) => {
  try {
    const { maxCount = 10 } = req.body;
    const result = await dqaService.autoEnhanceChainHospitals(maxCount);
    res.json(result);
  } catch (error) {
    logger.error('自动补充连锁医院API错误:', error);
    res.status(500).json({
      success: false,
      message: '自动补充失败',
      error: error.message
    });
  }
});

// ========== DQA生成相关 ==========

/**
 * 手动生成DQA
 * POST /api/dqa/generate
 */
router.post('/generate', async (req, res) => {
  try {
    const { count = 1 } = req.body;
    
    if (count < 1 || count > 100) {
      return res.status(400).json({
        success: false,
        message: '生成数量必须在1-100之间'
      });
    }

    const result = await dqaService.generateDQA(count);
    res.json({
      success: true,
      message: `成功生成${count}条DQA`,
      data: result
    });
  } catch (error) {
    logger.error('生成DQA API错误:', error);
    res.status(500).json({
      success: false,
      message: '生成DQA失败',
      error: error.message
    });
  }
});

/**
 * 获取DQA统计信息
 * GET /api/dqa/stats
 */
router.get('/stats', async (req, res) => {
  try {
    const stats = dqaService.getStats();
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    logger.error('获取DQA统计API错误:', error);
    res.status(500).json({
      success: false,
      message: '获取统计信息失败',
      error: error.message
    });
  }
});

/**
 * 控制定时任务
 * POST /api/dqa/scheduler/:action
 * action: start | stop | restart
 */
router.post('/scheduler/:action', async (req, res) => {
  try {
    const { action } = req.params;
    
    if (!['start', 'stop', 'restart'].includes(action)) {
      return res.status(400).json({
        success: false,
        message: '无效的操作，支持: start, stop, restart'
      });
    }

    const result = dqaService.controlScheduler(action);
    res.json(result);
  } catch (error) {
    logger.error('控制定时任务API错误:', error);
    res.status(500).json({
      success: false,
      message: '控制定时任务失败',
      error: error.message
    });
  }
});

/**
 * DQA服务状态
 * GET /api/dqa/status
 */
router.get('/status', async (req, res) => {
  try {
    const stats = dqaService.getStats();
    res.json({
      success: true,
      service: 'DQA Hospital Q&A Service',
      version: '1.0.0',
      status: 'running',
      scheduler: stats
    });
  } catch (error) {
    logger.error('获取DQA状态API错误:', error);
    res.status(500).json({
      success: false,
      message: '获取状态失败',
      error: error.message
    });
  }
});

export default router;

