import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import cors from 'cors';
import helmet from 'helmet';
import { testConnection } from './models/index.js';
import routes from './api/routes.js';
import { logger } from './utils/logger.js';
import dqaService from './dqa/dqaService.js';

// 加载环境变量
dotenv.config({ path: './config.env' });

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5002;

// 安全中间件
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

// CORS配置
app.use(cors({
  origin: [
    process.env.FRONTEND_URL || 'http://localhost:4321',
    'http://localhost:5001',
    'http://47.237.79.9:5001',
    'http://47.237.79.9:5002',
    // 允许n8n和其他外部服务访问
    /^https?:\/\/.*\.n8n\.cloud$/,
    /^https?:\/\/.*\.n8n\.io$/,
    /^https?:\/\/.*\.ngrok\.io$/,
    /^https?:\/\/.*\.ngrok-free\.app$/
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept']
}));

// 基础中间件
app.use(compression()); // 启用gzip压缩
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 限流中间件
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15分钟
  max: 100, // 限制每个IP 15分钟内最多100个请求
  message: {
    success: false,
    message: '请求过于频繁，请稍后再试'
  }
});
app.use('/api/', limiter);

// 请求日志
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.url}`, {
    ip: req.ip,
    userAgent: req.get('User-Agent')
  });
  next();
});

// 路由
app.use('/', routes);

// 静态文件服务 (为前端提供API)
app.use('/static', express.static(path.join(__dirname, '../../dist')));

// 错误处理中间件
app.use((err, req, res, next) => {
  logger.error('Unhandled error:', err);
  
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
    timestamp: new Date().toISOString(),
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// 404处理
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    path: req.originalUrl,
    timestamp: new Date().toISOString()
  });
});

// 启动服务器
const startServer = async () => {
  try {
    // 测试数据库连接
    await testConnection();
    
    // 启动HTTP服务器
    app.listen(PORT, '0.0.0.0', () => {
      logger.info(`🚀 后端服务启动成功`);
      logger.info(`📡 服务地址: http://0.0.0.0:${PORT}`);
      logger.info(`🌍 环境: ${process.env.NODE_ENV || 'development'}`);
      logger.info(`📊 健康检查: http://0.0.0.0:${PORT}/health`);
      logger.info(`📚 API文档: http://0.0.0.0:${PORT}/api/info`);
      logger.info(`🤖 DQA服务: http://0.0.0.0:${PORT}/api/dqa/status`);
    });

    // 初始化DQA服务（延迟5秒启动，确保数据库完全就绪）
    setTimeout(async () => {
      try {
        await dqaService.initialize();
        logger.info('✅ DQA定时任务已启动，每15分钟自动生成医院问答');
      } catch (error) {
        logger.error('⚠️ DQA服务启动失败:', error);
      }
    }, 5000);
  } catch (error) {
    logger.error('❌ 服务器启动失败:', error);
    process.exit(1);
  }
};

// 优雅关闭
process.on('SIGTERM', () => {
  logger.info('收到SIGTERM信号，开始优雅关闭...');
  dqaService.shutdown();
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('收到SIGINT信号，开始优雅关闭...');
  dqaService.shutdown();
  process.exit(0);
});

// 未捕获的异常处理
process.on('uncaughtException', (error) => {
  logger.error('未捕获的异常:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('未处理的Promise拒绝:', reason);
  process.exit(1);
});

// 启动服务器
startServer();

export default app;
