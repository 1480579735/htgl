const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ code: -1, message: '未提供认证令牌' });
    }
    
    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      return res.status(401).json({ code: -1, message: '令牌格式错误' });
    }
    
    const token = parts[1];
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ code: -1, message: '令牌已过期' });
    }
    return res.status(401).json({ code: -1, message: '无效的令牌' });
  }
};

const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ code: -1, message: '未认证' });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ code: -1, message: '权限不足' });
    }
    next();
  };
};

module.exports = { authenticate, requireRole };