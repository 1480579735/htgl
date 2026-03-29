const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const Database = require('../core/db');

const db = new Database();

// 获取付款列表
router.get('/', auth, async (req, res) => {
  try {
    await db.connect();
    const { page = 1, size = 20, contractId, type, status } = req.query;
    
    let sql = `
      SELECT p.*, c.code as contract_code, c.name as contract_name, c.cust_name as customer_name
      FROM payments p
      LEFT JOIN contracts c ON p.contract_id = c.id
      WHERE 1=1
    `;
    const params = {};
    let idx = 0;
    
    if (contractId) {
      sql += ` AND p.contract_id = @p${idx}`;
      params[`p${idx}`] = parseInt(contractId);
      idx++;
    }
    if (type) {
      sql += ` AND p.type = @p${idx}`;
      params[`p${idx}`] = type;
      idx++;
    }
    if (status !== undefined) {
      sql += ` AND p.status = @p${idx}`;
      params[`p${idx}`] = parseInt(status);
      idx++;
    }
    
    sql += " ORDER BY p.due_date ASC";
    
    const offset = (parseInt(page) - 1) * parseInt(size);
    sql += ` OFFSET @offset ROWS FETCH NEXT @size ROWS ONLY`;
    params.offset = offset;
    params.size = parseInt(size);
    
    const payments = await db.query(sql, params);
    
    // 获取总数
    let countSql = "SELECT COUNT(*) as total FROM payments p WHERE 1=1";
    if (contractId) countSql += ` AND contract_id = ${contractId}`;
    if (type) countSql += ` AND type = '${type}'`;
    if (status !== undefined) countSql += ` AND status = ${status}`;
    
    const countResult = await db.query(countSql);
    const total = countResult[0].total;
    
    res.json({
      code: 0,
      data: {
        list: payments,
        total,
        page: parseInt(page),
        size: parseInt(size),
        pages: Math.ceil(total / parseInt(size))
      }
    });
  } catch (err) {
    console.error('Get payments error:', err);
    res.status(500).json({ code: -1, msg: err.message });
  }
});

// 创建付款计划
router.post('/', auth, async (req, res) => {
  try {
    await db.connect();
    const { contractId, stage, amount, dueDate, type, remark } = req.body;
    
    const result = await db.execute(`
      INSERT INTO payments (contract_id, stage, amount, due_date, type, remark, status, created_at)
      VALUES (@contractId, @stage, @amount, @dueDate, @type, @remark, 0, GETDATE())
    `, { contractId, stage, amount, dueDate, type, remark: remark || '' });
    
    const newPayment = await db.query(
      "SELECT id FROM payments WHERE contract_id = @contractId AND stage = @stage",
      { contractId, stage }
    );
    
    res.json({ code: 0, data: { id: newPayment[0].id }, msg: '创建成功' });
  } catch (err) {
    console.error('Create payment error:', err);
    res.status(500).json({ code: -1, msg: err.message });
  }
});

// 记录付款
router.post('/:id/pay', auth, async (req, res) => {
  try {
    await db.connect();
    const { actualDate, invoiceNo, remark } = req.body;
    
    await db.execute(`
      UPDATE payments 
      SET status = 1, actual_date = @actualDate, invoice_no = @invoiceNo, remark = @remark
      WHERE id = @id AND status = 0
    `, {
      id: parseInt(req.params.id),
      actualDate,
      invoiceNo: invoiceNo || '',
      remark: remark || ''
    });
    
    res.json({ code: 0, msg: '记录成功' });
  } catch (err) {
    console.error('Record payment error:', err);
    res.status(500).json({ code: -1, msg: err.message });
  }
});

// 删除付款计划
router.delete('/:id', auth, async (req, res) => {
  try {
    await db.connect();
    await db.execute(
      "DELETE FROM payments WHERE id = @id AND status = 0",
      { id: parseInt(req.params.id) }
    );
    res.json({ code: 0, msg: '删除成功' });
  } catch (err) {
    console.error('Delete payment error:', err);
    res.status(500).json({ code: -1, msg: err.message });
  }
});

module.exports = router;