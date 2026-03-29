const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('../config');
const Database = require('../core/db');

// 创建数据库实例
const db = new Database();

router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    console.log('========== 登录请求 ==========');
    console.log('用户名:', username);
    
    if (!username || !password) {
      return res.status(400).json({ code: -1, msg: '用户名和密码不能为空' });
    }
    
    // 确保数据库连接
    await db.connect();
    
    // 查询用户
    const users = await db.query(
      "SELECT * FROM users WHERE name = @username AND del = 0",
      { username }
    );
    
    console.log('查询到用户数:', users.length);
    
    if (!users || users.length === 0) {
      console.log('用户不存在');
      return res.status(401).json({ code: -1, msg: '用户名或密码错误' });
    }
    
    const user = users[0];
    console.log('用户信息:', {
      id: user.id,
      name: user.name,
      role: user.role,
      status: user.status,
      pwdLength: user.pwd ? user.pwd.length : 0
    });
    
    if (user.status !== 1) {
      console.log('账号已禁用');
      return res.status(401).json({ code: -1, msg: '账号已被禁用' });
    }
    
    const isValid = await bcrypt.compare(password, user.pwd);
    console.log('密码验证结果:', isValid);
    
    if (!isValid) {
      console.log('密码错误');
      return res.status(401).json({ code: -1, msg: '用户名或密码错误' });
    }
    
    const token = jwt.sign(
      { id: user.id, name: user.name, role: user.role },
      config.jwt.secret,
      { expiresIn: config.jwt.expiresIn }
    );
    
    console.log('登录成功');
    console.log('============================');
    
    res.json({
      code: 0,
      data: {
        token,
        user: {
          id: user.id,
          name: user.name,
          realName: user.real_name || user.realName,
          role: user.role
        }
      }
    });
  } catch (err) {
    console.error('登录错误:', err);
    console.error('错误堆栈:', err.stack);
    res.status(500).json({ code: -1, msg: '服务器错误', error: err.message });
  }
});

module.exports = router;