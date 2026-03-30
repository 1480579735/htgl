const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../core/db');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    console.log('登录请求:', { username, password });
    
    if (!username || !password) {
      return res.status(400).json({ code: -1, message: '用户名和密码不能为空' });
    }
    
    // 先查询表结构，打印列名用于调试
    const columns = await db.query("SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'users'");
    console.log('users表列名:', columns);
    
    // 尝试多种可能的列名
    let users;
    try {
      users = await db.query(
        "SELECT id, username, password_hash, real_name, role FROM users WHERE username = @username AND is_deleted = 0",
        { username }
      );
    } catch (err) {
      // 如果 username 列不存在，尝试 name 列
      users = await db.query(
        "SELECT id, name as username, password, real_name, role FROM users WHERE name = @username AND is_deleted = 0",
        { username }
      );
    }
    
    console.log('查询结果:', users);
    
    if (users.length === 0) {
      return res.status(401).json({ code: -1, message: '用户名或密码错误' });
    }
    
    const user = users[0];
    
    // 检查密码字段名
    let passwordHash = user.password_hash || user.password;
    if (!passwordHash) {
      return res.status(401).json({ code: -1, message: '用户数据异常' });
    }
    
    const isValid = await bcrypt.compare(password, passwordHash);
    console.log('密码验证:', isValid);
    
    if (!isValid) {
      return res.status(401).json({ code: -1, message: '用户名或密码错误' });
    }
    
    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    res.json({
      code: 0,
      data: {
        token,
        user: {
          id: user.id,
          username: user.username,
          realName: user.real_name,
          role: user.role
        }
      }
    });
  } catch (err) {
    console.error('登录错误:', err);
    res.status(500).json({ code: -1, message: err.message });
  }
});

module.exports = router;