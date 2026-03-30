const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const { authenticate, requireRole } = require('../middleware/auth');
const db = require('../core/db');  // 正确导入

// 获取用户列表 (仅管理员)
router.get('/', authenticate, requireRole(['admin']), async (req, res) => {
  try {
    const users = await db.query(
      "SELECT id, username, real_name, role, status, created_at FROM users WHERE is_deleted = 0 ORDER BY created_at DESC"
    );
    res.json({ code: 0, data: { list: users, total: users.length } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ code: -1, message: err.message });
  }
});

// 创建用户 (仅管理员)
router.post('/', authenticate, requireRole(['admin']), async (req, res) => {
  try {
    const { username, realName, password, role = 'user' } = req.body;
    
    if (!username || !realName || !password) {
      return res.status(400).json({ code: -1, message: '用户名、姓名和密码不能为空' });
    }
    
    // 检查用户名是否存在
    const existUser = await db.query(
      "SELECT id FROM users WHERE username = @username AND is_deleted = 0",
      { username }
    );
    
    if (existUser.length > 0) {
      return res.status(400).json({ code: -1, message: '用户名已存在' });
    }
    
    const hashedPwd = await bcrypt.hash(password, 10);
    
    await db.execute(`
      INSERT INTO users (username, password_hash, real_name, role, status, created_at, updated_at)
      VALUES (@username, @pwd, @realName, @role, 1, GETDATE(), GETDATE())
    `, { username, pwd: hashedPwd, realName, role });
    
    res.json({ code: 0, message: '用户创建成功' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ code: -1, message: err.message });
  }
});

// 更新用户 (仅管理员)
router.put('/:id', authenticate, requireRole(['admin']), async (req, res) => {
  try {
    const { realName, role, status } = req.body;
    await db.execute(
      `UPDATE users SET real_name = @realName, role = @role, status = @status, updated_at = GETDATE()
       WHERE id = @id AND is_deleted = 0`,
      { id: req.params.id, realName, role, status }
    );
    res.json({ code: 0, message: '用户更新成功' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ code: -1, message: err.message });
  }
});

// 重置用户密码 (仅管理员)
router.post('/:id/reset-password', authenticate, requireRole(['admin']), async (req, res) => {
  try {
    const { newPassword } = req.body;
    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ code: -1, message: '新密码长度至少6位' });
    }
    const hashedPwd = await bcrypt.hash(newPassword, 10);
    await db.execute(
      `UPDATE users SET password_hash = @pwd, updated_at = GETDATE() WHERE id = @id`,
      { id: req.params.id, pwd: hashedPwd }
    );
    res.json({ code: 0, message: '密码重置成功' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ code: -1, message: err.message });
  }
});

// 删除用户 (仅管理员)
router.delete('/:id', authenticate, requireRole(['admin']), async (req, res) => {
  try {
    if (parseInt(req.params.id) === req.user.id) {
      return res.status(400).json({ code: -1, message: '不能删除自己的账号' });
    }
    await db.execute(
      `UPDATE users SET is_deleted = 1, deleted_at = GETDATE() WHERE id = @id`,
      { id: req.params.id }
    );
    res.json({ code: 0, message: '用户已删除' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ code: -1, message: err.message });
  }
});

// 当前用户修改密码
router.post('/change-password', authenticate, async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    if (!oldPassword || !newPassword) {
      return res.status(400).json({ code: -1, message: '原密码和新密码不能为空' });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ code: -1, message: '新密码长度至少6位' });
    }

    const user = await db.query(
      "SELECT password_hash FROM users WHERE id = @id AND is_deleted = 0",
      { id: req.user.id }
    );
    
    if (!user || user.length === 0) {
      return res.status(404).json({ code: -1, message: '用户不存在' });
    }
    
    const isValid = await bcrypt.compare(oldPassword, user[0].password_hash);
    if (!isValid) {
      return res.status(400).json({ code: -1, message: '原密码错误' });
    }
    
    const hashedPwd = await bcrypt.hash(newPassword, 10);
    await db.execute(
      `UPDATE users SET password_hash = @pwd, updated_at = GETDATE() WHERE id = @id`,
      { id: req.user.id, pwd: hashedPwd }
    );
    
    res.json({ code: 0, message: '密码修改成功，请重新登录' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ code: -1, message: err.message });
  }
});

module.exports = router;