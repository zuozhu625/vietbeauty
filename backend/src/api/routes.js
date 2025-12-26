import express from 'express';

// 导入路由
import userShareRoutes from './userShareRoutes.js';
import knowledgeRoutes from './knowledgeRoutes.js';
import hospitalRoutes from './hospitalRoutes.js';
import serviceRoutes from './serviceRoutes.js';
import contactRoutes from './contactRoutes.js';
import webhookRoutes from './webhookRoutes.js';
import dqaRoutes from '../dqa/dqaRoutes.js';
import sitemapPaginatedRoutes from './sitemapPaginatedRoutes.js';

const router = express.Router();

// 健康检查
router.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV
  });
});

// API版本信息
router.get('/api/info', (req, res) => {
  res.json({
    name: 'Vietnam Medical Backend API',
    version: '1.0.0',
    description: '越南医疗整形项目后端API服务',
    endpoints: {
      userShares: '/api/user-shares',
      knowledge: '/api/knowledge',
      hospitals: '/api/hospitals',
      services: '/api/services',
      contacts: '/api/contacts',
      webhooks: '/api/webhooks',
      dqa: '/api/dqa'
    }
  });
});

// 路由注册
router.use('/api/user-shares', userShareRoutes);
router.use('/api/knowledge', knowledgeRoutes);
router.use('/api/hospitals', hospitalRoutes);
router.use('/api/services', serviceRoutes);
router.use('/api/contacts', contactRoutes);
router.use('/api/webhooks', webhookRoutes);
router.use('/api/dqa', dqaRoutes);
router.use('/api/sitemap-paginated', sitemapPaginatedRoutes);

// 404处理
router.use('*', (req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.originalUrl} not found`,
    timestamp: new Date().toISOString()
  });
});

// 错误处理中间件
router.use((err, req, res, next) => {
  console.error('API Error:', err);
  
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
    timestamp: new Date().toISOString(),
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

export default router;
