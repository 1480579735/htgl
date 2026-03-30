const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const db = require('../core/db');

// 获取付款列表
router.get('/', authenticate, async (req, res) => {
  try {
    const { page = 1, limit = 20, type, status, contractId } = req.query;
    
    console.log('查询付款参数:', { page, limit, type, status, contractId });
    
    let sql = `
      SELECT p.*, c.code as contract_code, c.title as contract_name, pt.name as customer_name
      FROM payments p
      LEFT JOIN contracts c ON p.contract_id = c.id
      LEFT JOIN parties pt ON c.party_id = pt.id
      WHERE p.is_deleted = 0
    `;
    const params = {};
    let idx = 0;
    
    if (type && type !== '') {
      sql += ` AND p.type = @p${idx}`;
      params[`p${idx}`] = type;
      idx++;
    }
    if (status !== undefined && status !== '') {
      sql += ` AND p.status = @p${idx}`;
      params[`p${idx}`] = parseInt(status);
      idx++;
    }
    if (contractId && contractId !== '') {
      sql += ` AND p.contract_id = @p${idx}`;
      params[`p${idx}`] = parseInt(contractId);
      idx++;
    }
    
    sql += " ORDER BY p.due_date ASC";
    
    const offset = (parseInt(page) - 1) * parseInt(limit);
    sql += ` OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY`;
    params.offset = offset;
    params.limit = parseInt(limit);
    
    console.log('执行SQL:', sql);
    
    const payments = await db.query(sql, params);
    console.log('查询结果数量:', payments.length);
    
    // 获取总数
    let countSql = "SELECT COUNT(*) as total FROM payments p WHERE p.is_deleted = 0";
    if (type && type !== '') countSql += ` AND p.type = '${type}'`;
    if (status !== undefined && status !== '') countSql += ` AND p.status = ${status}`;
    if (contractId && contractId !== '') countSql += ` AND p.contract_id = ${contractId}`;
    
    const countRes = await db.query(countSql);
    const total = countRes[0]?.total || 0;
    
    res.json({
      code: 0,
      data: {
        list: payments,
        total: total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (err) {
    console.error('获取付款列表错误:', err);
    res.status(500).json({ code: -1, message: err.message });
  }
});

// 创建付款计划
router.post('/', authenticate, async (req, res) => {
  try {
    const { contractId, stage, amount, dueDate, type, remark } = req.body;
    
    console.log('创建付款计划:', { contractId, stage, amount, dueDate, type });
    
    if (!contractId || !stage || !amount || !dueDate) {
      return res.status(400).json({ code: -1, message: '合同ID、阶段、金额和到期日期不能为空' });
    }
    
    await db.execute(`
      INSERT INTO payments (contract_id, stage, amount, due_date, type, remark, status, created_at)
      VALUES (@contractId, @stage, @amount, @dueDate, @type, @remark, 0, GETDATE())
    `, {
      contractId,
      stage,
      amount,
      dueDate,
      type: type || 'payment',
      remark: remark || ''
    });
    
    res.json({ code: 0, message: '创建成功' });
  } catch (err) {
    console.error('创建付款计划错误:', err);
    res.status(500).json({ code: -1, message: err.message });
  }
});

// 记录付款
router.post('/:id/pay', authenticate, async (req, res) => {
  try {
    const { actualDate, invoiceNo, remark } = req.body;
    console.log('记录付款:', { id: req.params.id, actualDate, invoiceNo });
    
    await db.execute(`
      UPDATE payments SET 
        status = 1, 
        actual_date = @actualDate, 
        invoice_no = @invoiceNo, 
        remark = @remark
      WHERE id = @id AND status = 0
    `, {
      id: req.params.id,
      actualDate,
      invoiceNo: invoiceNo || '',
      remark: remark || ''
    });
    
    res.json({ code: 0, message: '记录成功' });
  } catch (err) {
    console.error('记录付款错误:', err);
    res.status(500).json({ code: -1, message: err.message });
  }
});

// 删除付款计划
router.delete('/:id', authenticate, async (req, res) => {
  try {
    await db.execute(
      "UPDATE payments SET is_deleted = 1 WHERE id = @id AND status = 0",
      { id: req.params.id }
    );
    res.json({ code: 0, message: '删除成功' });
  } catch (err) {
    console.error('删除付款计划错误:', err);
    res.status(500).json({ code: -1, message: err.message });
  }
});

module.exports = router;