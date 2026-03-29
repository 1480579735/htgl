const { logger } = require('../utils/log');

function requestLogger(req, res, next) {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    const level = res.statusCode >= 400 ? 'warn' : 'info';
    
    logger[level](`${req.method} ${req.url} ${res.statusCode} - ${duration}ms`, {
      method: req.method,
      url: req.url,
      status: res.statusCode,
      duration,
      ip: req.ip,
      user: req.user?.id
    });
  });
  
  next();
}

module.exports = { requestLogger };