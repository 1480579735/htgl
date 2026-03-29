const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const Database = require('../core/db');

const db = new Database();

// 获取供应商列表
router.get('/', auth, async (req, res) => {
  try {
    await db.connect();
    const { page = 1, size = 20, rating, status, kw } = req.query;
    
    let sql = "SELECT * FROM suppliers WHERE del = 0";
    const params = {};
    let idx = 0;
    
    if (rating) {
      sql += ` AND rating = @p${idx}`;
      params[`p${idx}`] = parseInt(rating);
      idx++;
    }
    if (status !== undefined) {
      sql += ` AND status = @p${idx}`;
      params[`p${idx}`] = parseInt(status);
      idx++;
    }
    if (kw) {
      sql += ` AND (name LIKE @p${idx} OR code LIKE @p${idx} OR contact LIKE @p${idx})`;
      params[`p${idx}`] = `%${kw}%`;
      idx++;
    }
    
    sql += " ORDER BY created_at DESC";
    
    const offset = (parseInt(page) - 1) * parseInt(size);
    sql += ` OFFSET @offset ROWS FETCH NEXT @size ROWS ONLY`;
    params.offset = offset;
    params.size = parseInt(size);
    
    const list = await db.query(sql, params);
    
    // 获取总数
    let countSql = "SELECT COUNT(*) as total FROM suppliers WHERE del = 0";
    if (rating) countSql += ` AND rating = ${rating}`;
    if (status !== undefined) countSql += ` AND status = ${status}`;
    if (kw) countSql += ` AND (name LIKE '%${kw}%' OR code LIKE '%${kw}%')`;
    
    const countRes = await db.query(countSql);
    const total = countRes[0].total;
    
    res.json({
      code: 0,
      data: {
        list,
        total,
        page: parseInt(page),
        size: parseInt(size),
        pages: Math.ceil(total / parseInt(size))
      }
    });
  } catch (err) {
    console.error('Get suppliers error:', err);
    res.status(500).json({ code: -1, msg: err.message });
  }
});

// 获取供应商详情
router.get('/:id', auth, async (req, res) => {
  try {
    await db.connect();
    const sql = "SELECT * FROM suppliers WHERE id = @id AND del = 0";
    const rows = await db.query(sql, { id: parseInt(req.params.id) });
    
    if (rows.length === 0) {
      return res.status(404).json({ code: -1, msg: '供应商不存在' });
    }
    
    res.json({ code: 0, data: rows[0] });
  } catch (err) {
    console.error('Get supplier error:', err);
    res.status(500).json({ code: -1, msg: err.message });
  }
});

// 创建供应商
router.post('/', auth, async (req, res) => {
  try {
    await db.connect();
    const { code, name, contact, phone, email, address, bankName, bankAccount, taxNo, rating } = req.body;
    
    const newCode = code || `SUP${Date.now()}`;
    
    const result = await db.execute(`
      INSERT INTO suppliers (code, name, contact, phone, email, address, bank_name, bank_account, tax_no, rating, status, created_at, updated_at)
      VALUES (@code, @name, @contact, @phone, @email, @address, @bankName, @bankAccount, @taxNo, @rating, 1, GETDATE(), GETDATE())
    `, {
      code: newCode,
      name,
      contact: contact || '',
      phone: phone || '',
      email: email || '',
      address: address || '',
      bankName: bankName || '',
      bankAccount: bankAccount || '',
      taxNo: taxNo || '',
      rating: rating || 3
    });
    
    const newSupplier = await db.query("SELECT id FROM suppliers WHERE code = @code", { code: newCode });
    
    res.json({ code: 0, data: { id: newSupplier[0].id }, msg: '创建成功' });
  } catch (err) {
    console.error('Create supplier error:', err);
    res.status(500).json({ code: -1, msg: err.message });
  }
});

// 更新供应商
router.put('/:id', auth, async (req, res) => {
  try {
    await db.connect();
    const { name, contact, phone, email, address, bankName, bankAccount, taxNo, rating } = req.body;
    
    await db.execute(`
      UPDATE suppliers 
      SET name = @name, contact = @contact, phone = @phone, email = @email, address = @address,
          bank_name = @bankName, bank_account = @bankAccount, tax_no = @taxNo, rating = @rating, updated_at = GETDATE()
      WHERE id = @id AND del = 0
    `, {
      id: parseInt(req.params.id),
      name,
      contact: contact || '',
      phone: phone || '',
      email: email || '',
      address: address || '',
      bankName: bankName || '',
      bankAccount: bankAccount || '',
      taxNo: taxNo || '',
      rating: rating || 3
    });
    
    res.json({ code: 0, msg: '更新成功' });
  } catch (err) {
    console.error('Update supplier error:', err);
    res.status(500).json({ code: -1, msg: err.message });
  }
});

// 更新供应商状态
router.patch('/:id/status', auth, async (req, res) => {
  try {
    await db.connect();
    const { status } = req.body;
    await db.execute(
      "UPDATE suppliers SET status = @status, updated_at = GETDATE() WHERE id = @id AND del = 0",
      { id: parseInt(req.params.id), status }
    );
    res.json({ code: 0, msg: '状态更新成功' });
  } catch (err) {
    console.error('Update status error:', err);
    res.status(500).json({ code: -1, msg: err.message });
  }
});

// 更新供应商等级
router.patch('/:id/rating', auth, async (req, res) => {
  try {
    await db.connect();
    const { rating } = req.body;
    await db.execute(
      "UPDATE suppliers SET rating = @rating, updated_at = GETDATE() WHERE id = @id AND del = 0",
      { id: parseInt(req.params.id), rating }
    );
    res.json({ code: 0, msg: '等级更新成功' });
  } catch (err) {
    console.error('Update rating error:', err);
    res.status(500).json({ code: -1, msg: err.message });
  }
});

// 删除供应商
router.delete('/:id', auth, async (req, res) => {
  try {
    await db.connect();
    await db.execute(
      "UPDATE suppliers SET del = 1, deleted_at = GETDATE() WHERE id = @id",
      { id: parseInt(req.params.id) }
    );
    res.json({ code: 0, msg: '删除成功' });
  } catch (err) {
    console.error('Delete supplier error:', err);
    res.status(500).json({ code: -1, msg: err.message });
  }
});

// 获取TOP供应商
router.get('/top/list', auth, async (req, res) => {
  try {
    await db.connect();
    const { limit = 10 } = req.query;
    const sql = `
      SELECT * FROM suppliers 
      WHERE del = 0 AND status = 1 
      ORDER BY rating DESC, name ASC 
      OFFSET 0 ROWS FETCH NEXT @limit ROWS ONLY
    `;
    const list = await db.query(sql, { limit: parseInt(limit) });
    res.json({ code: 0, data: list });
  } catch (err) {
    console.error('Get top suppliers error:', err);
    res.status(500).json({ code: -1, msg: err.message });
  }
});

// 获取统计数据
router.get('/stats/dashboard', auth, async (req, res) => {
  try {
    await db.connect();
    
    const totalRes = await db.query("SELECT COUNT(*) as cnt FROM suppliers WHERE del = 0");
    const total = totalRes[0]?.cnt || 0;
    
    const activeRes = await db.query("SELECT COUNT(*) as cnt FROM suppliers WHERE del = 0 AND status = 1");
    const active = activeRes[0]?.cnt || 0;
    
    const avgRes = await db.query("SELECT ISNULL(AVG(CAST(rating AS FLOAT)), 0) as avgRating FROM suppliers WHERE del = 0");
    const avgRating = avgRes[0]?.avgRating || 0;
    
    const highRes = await db.query("SELECT COUNT(*) as cnt FROM suppliers WHERE del = 0 AND rating >= 4");
    const highRating = highRes[0]?.cnt || 0;
    
    res.json({
      code: 0,
      data: {
        total,
        active,
        avgRating,
        highRating
      }
    });
  } catch (err) {
    console.error('Get stats error:', err);
    res.status(500).json({ code: -1, msg: err.message });
  }
});

module.exports = router;