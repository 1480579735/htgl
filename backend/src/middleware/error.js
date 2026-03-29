const { logger } = require('../utils/log');

function errorHandler(err, req, res, next) {
  logger.error(`${req.method} ${req.url} - ${err.message}`, {
    stack: err.stack,
    body: req.body,
    query: req.query,
    user: req.user
  });
  
  if (err.message.includes('不能为空') || err.message.includes('必须')) {
    return res.status(400).json({ code: -1, msg: err.message });
  }
  
  if (err.message.includes('不存在')) {
    return res.status(404).json({ code: -1, msg: err.message });
  }
  
  if (err.message.includes('权限') || err.message.includes('不允许')) {
    return res.status(403).json({ code: -1, msg: err.message });
  }
  
  res.status(500).json({ code: -1, msg: '服务器错误' });
}

module.exports = { errorHandler };