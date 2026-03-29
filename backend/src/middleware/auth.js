const jwt = require('jsonwebtoken');
const config = require('../config');

function auth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ code: -1, msg: '未提供认证令牌' });
  }
  
  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return res.status(401).json({ code: -1, msg: '令牌格式错误' });
  }
  
  const token = parts[1];
  try {
    const decoded = jwt.verify(token, config.jwt.secret);
    req.user = decoded;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ code: -1, msg: '令牌已过期' });
    }
    return res.status(401).json({ code: -1, msg: '无效的令牌' });
  }
}

function requireRole(roles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ code: -1, msg: '未认证' });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ code: -1, msg: '权限不足' });
    }
    next();
  };
}

module.exports = { auth, requireRole };