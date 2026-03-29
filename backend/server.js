require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const apiRoutes = require('./src/api');

const app = express();
const PORT = process.env.PORT || 3000;

// 中间件
app.use(helmet({
  contentSecurityPolicy: false,
}));
app.use(compression());
app.use(cors({
  origin: (process.env.CORS_ORIGIN || 'http://localhost:5173').split(','),
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 请求日志
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// API路由
app.use('/api', apiRoutes);

// 健康检查
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date() });
});

// 错误处理
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ code: -1, msg: err.message });
});

// 启动服务
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Test API: http://localhost:${PORT}/api/test`);
  console.log(`Login API: http://localhost:${PORT}/api/auth/login`);
});

module.exports = app;