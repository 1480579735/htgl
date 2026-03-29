const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const Database = require('../core/db');

const db = new Database();

// 获取客户列表
router.get('/', auth, async (req, res) => {
  try {
    await db.connect();
    const { page = 1, size = 20, risk, kw } = req.query;
    
    let sql = "SELECT * FROM customers WHERE del = 0";
    const params = {};
    let idx = 0;
    
    if (risk) {
      sql += ` AND risk = @p${idx}`;
      params[`p${idx}`] = parseInt(risk);
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
    
    const customers = await db.query(sql, params);
    
    let countSql = "SELECT COUNT(*) as total FROM customers WHERE del = 0";
    if (risk) countSql += ` AND risk = ${risk}`;
    if (kw) countSql += ` AND (name LIKE '%${kw}%' OR code LIKE '%${kw}%')`;
    
    const countResult = await db.query(countSql);
    const total = countResult[0].total;
    
    res.json({
      code: 0,
      data: {
        list: customers,
        total,
        page: parseInt(page),
        size: parseInt(size),
        pages: Math.ceil(total / parseInt(size))
      }
    });
  } catch (err) {
    console.error('Get customers error:', err);
    res.status(500).json({ code: -1, msg: err.message });
  }
});

// 创建客户
router.post('/', auth, async (req, res) => {
  try {
    await db.connect();
    const { code, name, contact, phone, email, address } = req.body;
    
    const result = await db.execute(`
      INSERT INTO customers (code, name, contact, phone, email, address, created_at, updated_at)
      VALUES (@code, @name, @contact, @phone, @email, @address, GETDATE(), GETDATE())
    `, { code, name, contact: contact || '', phone: phone || '', email: email || '', address: address || '' });
    
    const newCustomer = await db.query(
      "SELECT id FROM customers WHERE code = @code",
      { code }
    );
    
    res.json({ code: 0, data: { id: newCustomer[0].id }, msg: '创建成功' });
  } catch (err) {
    console.error('Create customer error:', err);
    res.status(500).json({ code: -1, msg: err.message });
  }
});

// 更新客户
router.put('/:id', auth, async (req, res) => {
  try {
    await db.connect();
    const { name, contact, phone, email, address } = req.body;
    
    await db.execute(`
      UPDATE customers 
      SET name = @name, contact = @contact, phone = @phone, email = @email, address = @address, updated_at = GETDATE()
      WHERE id = @id AND del = 0
    `, {
      id: parseInt(req.params.id),
      name,
      contact: contact || '',
      phone: phone || '',
      email: email || '',
      address: address || ''
    });
    
    res.json({ code: 0, msg: '更新成功' });
  } catch (err) {
    console.error('Update customer error:', err);
    res.status(500).json({ code: -1, msg: err.message });
  }
});

// 删除客户
router.delete('/:id', auth, async (req, res) => {
  try {
    await db.connect();
    
    // 检查是否有关联合同
    const contracts = await db.query(
      "SELECT COUNT(*) as cnt FROM contracts WHERE cust_id = @id AND del = 0",
      { id: parseInt(req.params.id) }
    );
    
    if (contracts[0].cnt > 0) {
      return res.status(400).json({ code: -1, msg: '该客户存在关联合同，无法删除' });
    }
    
    await db.execute(
      "UPDATE customers SET del = 1, deleted_at = GETDATE() WHERE id = @id",
      { id: parseInt(req.params.id) }
    );
    
    res.json({ code: 0, msg: '删除成功' });
  } catch (err) {
    console.error('Delete customer error:', err);
    res.status(500).json({ code: -1, msg: err.message });
  }
});

module.exports = router;