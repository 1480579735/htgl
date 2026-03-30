const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const db = require('../core/db');

// 获取合同列表
router.get('/', authenticate, async (req, res) => {
  try {
    const { page = 1, limit = 20, status, type, keyword } = req.query;
    
    console.log('查询合同参数:', { page, limit, status, type, keyword });
    
    let sql = "SELECT * FROM contracts WHERE is_deleted = 0";
    const params = {};
    let idx = 0;
    
    if (status && status !== '') {
      sql += ` AND status = @p${idx}`;
      params[`p${idx}`] = parseInt(status);
      idx++;
    }
    if (type && type !== '') {
      sql += ` AND type = @p${idx}`;
      params[`p${idx}`] = type;
      idx++;
    }
    if (keyword && keyword !== '') {
      sql += ` AND (code LIKE @p${idx} OR title LIKE @p${idx})`;
      params[`p${idx}`] = `%${keyword}%`;
      idx++;
    }
    
    sql += " ORDER BY created_at DESC";
    
    const offset = (parseInt(page) - 1) * parseInt(limit);
    sql += ` OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY`;
    params.offset = offset;
    params.limit = parseInt(limit);
    
    console.log('执行SQL:', sql);
    console.log('参数:', params);
    
    const contracts = await db.query(sql, params);
    console.log('查询结果数量:', contracts.length);
    
    // 获取总数
    let countSql = "SELECT COUNT(*) as total FROM contracts WHERE is_deleted = 0";
    if (status && status !== '') countSql += ` AND status = ${status}`;
    if (type && type !== '') countSql += ` AND type = '${type}'`;
    if (keyword && keyword !== '') countSql += ` AND (code LIKE '%${keyword}%' OR title LIKE '%${keyword}%')`;
    
    const countRes = await db.query(countSql);
    const total = countRes[0]?.total || 0;
    
    res.json({
      code: 0,
      data: {
        list: contracts,
        total: total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (err) {
    console.error('获取合同列表错误:', err);
    res.status(500).json({ code: -1, message: err.message });
  }
});

// 统计数据
router.get('/stats/dashboard', authenticate, async (req, res) => {
  try {
    console.log('获取仪表盘统计数据');
    
    const total = await db.query("SELECT COUNT(*) as cnt FROM contracts WHERE is_deleted = 0");
    const pending = await db.query("SELECT COUNT(*) as cnt FROM contracts WHERE status = 1 AND is_deleted = 0");
    const executing = await db.query("SELECT COUNT(*) as cnt FROM contracts WHERE status = 3 AND is_deleted = 0");
    const activeAmount = await db.query("SELECT ISNULL(SUM(amount), 0) as total FROM contracts WHERE status IN (2,3) AND is_deleted = 0");
    const avgAmount = await db.query("SELECT ISNULL(AVG(amount), 0) as avg FROM contracts WHERE status IN (2,3) AND is_deleted = 0");
    
    console.log('统计结果:', {
      total: total[0]?.cnt,
      pending: pending[0]?.cnt,
      executing: executing[0]?.cnt,
      activeAmount: activeAmount[0]?.total,
      avgAmount: avgAmount[0]?.avg
    });
    
    res.json({
      code: 0,
      data: {
        total: total[0]?.cnt || 0,
        pending: pending[0]?.cnt || 0,
        executingCount: executing[0]?.cnt || 0,
        activeAmount: activeAmount[0]?.total || 0,
        avgAmount: avgAmount[0]?.avg || 0
      }
    });
  } catch (err) {
    console.error('获取统计错误:', err);
    res.status(500).json({ code: -1, message: err.message });
  }
});

// 即将到期合同
router.get('/expiring/list', authenticate, async (req, res) => {
  try {
    const { days = 30 } = req.query;
    console.log('获取即将到期合同，天数:', days);
    
    const contracts = await db.query(`
      SELECT * FROM contracts 
      WHERE is_deleted = 0 AND status IN (2,3) 
        AND expiry_date BETWEEN GETDATE() AND DATEADD(DAY, @days, GETDATE())
      ORDER BY expiry_date ASC
    `, { days: parseInt(days) });
    
    console.log('到期合同数量:', contracts.length);
    res.json({ code: 0, data: contracts });
  } catch (err) {
    console.error('获取到期合同错误:', err);
    res.status(500).json({ code: -1, message: err.message });
  }
});

module.exports = router;