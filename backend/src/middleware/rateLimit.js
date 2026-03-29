const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15分钟
  max: 100, // 限制100次请求
  message: {
    code: -1,
    msg: '请求过于频繁，请稍后再试'
  },
  skipSuccessfulRequests: true,
  keyGenerator: (req) => {
    return req.user?.id || req.ip;
  }
});

const authLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1小时
  max: 5, // 限制5次登录尝试
  message: {
    code: -1,
    msg: '登录尝试次数过多，请1小时后再试'
  },
  skipSuccessfulRequests: true
});

module.exports = { limiter, authLimiter };