const express = require('express');
const router = express.Router();

// 认证路由
router.use('/auth', require('./auth'));

// 合同路由
router.use('/contracts', require('./contract'));

// 客户路由
router.use('/customers', require('./customer'));

// 供应商路由
router.use('/suppliers', require('./supplier'));

// 付款路由
router.use('/payments', require('./payment'));

// 上传路由
router.use('/upload', require('./upload'));

// 测试路由
router.get('/test', (req, res) => {
  res.json({ code: 0, msg: 'API is working' });
});

// 404 处理
router.use('*', (req, res) => {
  res.status(404).json({ code: -1, msg: 'API not found' });
});

module.exports = router;