const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const db = require('../core/db');

// 获取客户/供应商列表
router.get('/', authenticate, async (req, res) => {
  try {
    const { page = 1, limit = 20, type, keyword } = req.query;
    
    console.log('查询参数:', { page, limit, type, keyword });
    
    let sql = "SELECT * FROM parties WHERE is_deleted = 0";
    const params = {};
    let idx = 0;
    
    if (type && type !== '') {
      sql += ` AND type = @p${idx}`;
      params[`p${idx}`] = type;
      idx++;
    }
    if (keyword && keyword !== '') {
      sql += ` AND (code LIKE @p${idx} OR name LIKE @p${idx} OR contact LIKE @p${idx})`;
      params[`p${idx}`] = `%${keyword}%`;
      idx++;
    }
    
    sql += " ORDER BY created_at DESC";
    
    const offset = (parseInt(page) - 1) * parseInt(limit);
    sql += ` OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY`;
    params.offset = offset;
    params.limit = parseInt(limit);
    
    console.log('执行SQL:', sql);
    
    const parties = await db.query(sql, params);
    console.log('查询结果数量:', parties.length);
    
    // 获取总数
    let countSql = "SELECT COUNT(*) as total FROM parties WHERE is_deleted = 0";
    if (type && type !== '') countSql += ` AND type = '${type}'`;
    if (keyword && keyword !== '') countSql += ` AND (code LIKE '%${keyword}%' OR name LIKE '%${keyword}%')`;
    
    const countRes = await db.query(countSql);
    const total = countRes[0]?.total || 0;
    
    res.json({
      code: 0,
      data: {
        list: parties,
        total: total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (err) {
    console.error('获取列表错误:', err);
    res.status(500).json({ code: -1, message: err.message });
  }
});

// 获取TOP供应商
router.get('/top/list', authenticate, async (req, res) => {
  try {
    const { limit = 5 } = req.query;
    console.log('获取TOP供应商，限制:', limit);
    
    const suppliers = await db.query(`
      SELECT * FROM parties 
      WHERE type = 'supplier' AND is_deleted = 0 AND status = 1
      ORDER BY rating DESC, name ASC
      OFFSET 0 ROWS FETCH NEXT @limit ROWS ONLY
    `, { limit: parseInt(limit) });
    
    console.log('TOP供应商数量:', suppliers.length);
    res.json({ code: 0, data: suppliers });
  } catch (err) {
    console.error('获取TOP供应商错误:', err);
    res.status(500).json({ code: -1, message: err.message });
  }
});

module.exports = router;