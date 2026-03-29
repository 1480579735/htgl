const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const Database = require('../core/db');

// 创建数据库实例
const db = new Database();

// 获取合同列表
router.get('/', auth, async (req, res) => {
  try {
    await db.connect();
    const { page = 1, size = 20, status, type, direction, kw } = req.query;
    
    let sql = "SELECT * FROM contracts WHERE del = 0";
    const params = {};
    let idx = 0;
    
    if (status) {
      sql += ` AND status = @p${idx}`;
      params[`p${idx}`] = parseInt(status);
      idx++;
    }
    if (type) {
      sql += ` AND type = @p${idx}`;
      params[`p${idx}`] = type;
      idx++;
    }
    if (direction) {
      sql += ` AND direction = @p${idx}`;
      params[`p${idx}`] = parseInt(direction);
      idx++;
    }
    if (kw) {
      sql += ` AND (name LIKE @p${idx} OR code LIKE @p${idx})`;
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
    let countSql = "SELECT COUNT(*) as total FROM contracts WHERE del = 0";
    if (status) countSql += ` AND status = ${status}`;
    if (type) countSql += ` AND type = '${type}'`;
    if (direction) countSql += ` AND direction = ${direction}`;
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
    console.error('Get contracts error:', err);
    res.status(500).json({ code: -1, msg: err.message });
  }
});

// 获取合同详情
router.get('/:id', auth, async (req, res) => {
  try {
    await db.connect();
    const sql = "SELECT * FROM contracts WHERE id = @id AND del = 0";
    const rows = await db.query(sql, { id: parseInt(req.params.id) });
    
    if (rows.length === 0) {
      return res.status(404).json({ code: -1, msg: '合同不存在' });
    }
    
    res.json({ code: 0, data: rows[0] });
  } catch (err) {
    console.error('Get contract error:', err);
    res.status(500).json({ code: -1, msg: err.message });
  }
});

// 创建合同
router.post('/', auth, async (req, res) => {
  try {
    await db.connect();
    const { name, type, direction, amount, custId, supplierId, signDate, startDate, endDate, content } = req.body;
    
    // 生成合同编号
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const seqRes = await db.query(
      "SELECT COUNT(*) as cnt FROM contracts WHERE YEAR(created_at) = @year AND MONTH(created_at) = @month",
      { year, month }
    );
    const seq = seqRes[0].cnt + 1;
    const code = `CT${year}${month}${String(seq).padStart(6, '0')}`;
    
    let custName = '';
    let supplierName = '';
    
    if (direction === 1 && custId) {
      const custRes = await db.query("SELECT name FROM customers WHERE id = @id", { id: custId });
      if (custRes.length > 0) custName = custRes[0].name;
    } else if (direction === 2 && supplierId) {
      const supRes = await db.query("SELECT name FROM suppliers WHERE id = @id", { id: supplierId });
      if (supRes.length > 0) supplierName = supRes[0].name;
    }
    
    const result = await db.execute(`
      INSERT INTO contracts (code, name, type, direction, amount, cust_id, cust_name, supplier_id, supplier_name, sign_date, start_date, end_date, content, status, created_by, created_at, updated_at)
      VALUES (@code, @name, @type, @direction, @amount, @custId, @custName, @supplierId, @supplierName, @signDate, @startDate, @endDate, @content, 0, @createdBy, GETDATE(), GETDATE())
    `, {
      code,
      name,
      type,
      direction,
      amount,
      custId: custId || null,
      custName,
      supplierId: supplierId || null,
      supplierName,
      signDate,
      startDate,
      endDate,
      content: content || '',
      createdBy: req.user.id
    });
    
    const newContract = await db.query("SELECT id FROM contracts WHERE code = @code", { code });
    
    res.json({ code: 0, data: { id: newContract[0].id, code }, msg: '创建成功' });
  } catch (err) {
    console.error('Create contract error:', err);
    res.status(500).json({ code: -1, msg: err.message });
  }
});

// 更新合同
router.put('/:id', auth, async (req, res) => {
  try {
    await db.connect();
    const { name, type, direction, amount, custId, supplierId, signDate, startDate, endDate, content } = req.body;
    
    let custName = '';
    let supplierName = '';
    
    if (direction === 1 && custId) {
      const custRes = await db.query("SELECT name FROM customers WHERE id = @id", { id: custId });
      if (custRes.length > 0) custName = custRes[0].name;
    } else if (direction === 2 && supplierId) {
      const supRes = await db.query("SELECT name FROM suppliers WHERE id = @id", { id: supplierId });
      if (supRes.length > 0) supplierName = supRes[0].name;
    }
    
    await db.execute(`
      UPDATE contracts 
      SET name = @name, type = @type, direction = @direction, amount = @amount,
          cust_id = @custId, cust_name = @custName, supplier_id = @supplierId, supplier_name = @supplierName,
          sign_date = @signDate, start_date = @startDate, end_date = @endDate,
          content = @content, updated_at = GETDATE()
      WHERE id = @id AND del = 0
    `, {
      id: parseInt(req.params.id),
      name,
      type,
      direction,
      amount,
      custId: custId || null,
      custName,
      supplierId: supplierId || null,
      supplierName,
      signDate,
      startDate,
      endDate,
      content: content || ''
    });
    
    res.json({ code: 0, msg: '更新成功' });
  } catch (err) {
    console.error('Update contract error:', err);
    res.status(500).json({ code: -1, msg: err.message });
  }
});

// 提交审批
router.post('/:id/submit', auth, async (req, res) => {
  try {
    await db.connect();
    await db.execute(
      "UPDATE contracts SET status = 1, updated_at = GETDATE() WHERE id = @id AND status = 0",
      { id: parseInt(req.params.id) }
    );
    res.json({ code: 0, msg: '提交成功' });
  } catch (err) {
    console.error('Submit contract error:', err);
    res.status(500).json({ code: -1, msg: err.message });
  }
});

// 审批合同
router.post('/:id/approve', auth, async (req, res) => {
  try {
    await db.connect();
    const { result, remark } = req.body;
    
    if (result === 'pass') {
      await db.execute(
        "UPDATE contracts SET status = 2, updated_at = GETDATE() WHERE id = @id AND status = 1",
        { id: parseInt(req.params.id) }
      );
    } else {
      await db.execute(
        "UPDATE contracts SET status = 0, updated_at = GETDATE() WHERE id = @id AND status = 1",
        { id: parseInt(req.params.id) }
      );
    }
    
    res.json({ code: 0, msg: result === 'pass' ? '审批通过' : '已驳回' });
  } catch (err) {
    console.error('Approve contract error:', err);
    res.status(500).json({ code: -1, msg: err.message });
  }
});

// 开始执行
router.post('/:id/start', auth, async (req, res) => {
  try {
    await db.connect();
    await db.execute(
      "UPDATE contracts SET status = 3, updated_at = GETDATE() WHERE id = @id AND status = 2",
      { id: parseInt(req.params.id) }
    );
    res.json({ code: 0, msg: '已开始执行' });
  } catch (err) {
    console.error('Start contract error:', err);
    res.status(500).json({ code: -1, msg: err.message });
  }
});

// 完成合同
router.post('/:id/finish', auth, async (req, res) => {
  try {
    await db.connect();
    await db.execute(
      "UPDATE contracts SET status = 4, updated_at = GETDATE() WHERE id = @id AND status = 3",
      { id: parseInt(req.params.id) }
    );
    res.json({ code: 0, msg: '已完成' });
  } catch (err) {
    console.error('Finish contract error:', err);
    res.status(500).json({ code: -1, msg: err.message });
  }
});

// 终止合同
router.post('/:id/terminate', auth, async (req, res) => {
  try {
    await db.connect();
    const { reason } = req.body;
    await db.execute(
      "UPDATE contracts SET status = 5, updated_at = GETDATE() WHERE id = @id AND status IN (2,3)",
      { id: parseInt(req.params.id) }
    );
    res.json({ code: 0, msg: '已终止' });
  } catch (err) {
    console.error('Terminate contract error:', err);
    res.status(500).json({ code: -1, msg: err.message });
  }
});

// 删除合同
router.delete('/:id', auth, async (req, res) => {
  try {
    await db.connect();
    await db.execute(
      "UPDATE contracts SET del = 1, deleted_at = GETDATE() WHERE id = @id AND status = 0",
      { id: parseInt(req.params.id) }
    );
    res.json({ code: 0, msg: '删除成功' });
  } catch (err) {
    console.error('Delete contract error:', err);
    res.status(500).json({ code: -1, msg: err.message });
  }
});

// 获取统计数据
router.get('/stats/dashboard', auth, async (req, res) => {
  try {
    await db.connect();
    
    const totalRes = await db.query("SELECT COUNT(*) as cnt FROM contracts WHERE del = 0");
    const total = totalRes[0]?.cnt || 0;
    
    const pendingRes = await db.query("SELECT COUNT(*) as cnt FROM contracts WHERE del = 0 AND status = 1");
    const pending = pendingRes[0]?.cnt || 0;
    
    const activeRes = await db.query("SELECT COUNT(*) as cnt FROM contracts WHERE del = 0 AND status = 2");
    const active = activeRes[0]?.cnt || 0;
    
    const executingRes = await db.query("SELECT COUNT(*) as cnt FROM contracts WHERE del = 0 AND status = 3");
    const executingCount = executingRes[0]?.cnt || 0;
    
    const amountRes = await db.query("SELECT ISNULL(SUM(amount), 0) as total FROM contracts WHERE del = 0 AND status IN (2,3)");
    const activeAmount = amountRes[0]?.total || 0;
    
    const avgRes = await db.query("SELECT ISNULL(AVG(amount), 0) as avgAmt FROM contracts WHERE del = 0 AND status IN (2,3)");
    const avgAmount = avgRes[0]?.avgAmt || 0;
    
    res.json({
      code: 0,
      data: {
        total,
        pending,
        active,
        executingCount,
        activeAmount,
        avgAmount,
        salesAmount: 0,
        purchaseAmount: 0
      }
    });
  } catch (err) {
    console.error('Get stats error:', err);
    res.status(500).json({ code: -1, msg: err.message });
  }
});

// 获取即将到期合同
router.get('/expiring/list', auth, async (req, res) => {
  try {
    await db.connect();
    const { days = 30 } = req.query;
    const sql = `
      SELECT * FROM contracts 
      WHERE del = 0 AND status IN (2,3) 
        AND DATEDIFF(DAY, GETDATE(), end_date) BETWEEN 0 AND @days
      ORDER BY end_date ASC
    `;
    const list = await db.query(sql, { days: parseInt(days) });
    res.json({ code: 0, data: list });
  } catch (err) {
    console.error('Get expiring error:', err);
    res.status(500).json({ code: -1, msg: err.message });
  }
});

module.exports = router;