const bcrypt = require('bcryptjs');
const sql = require('mssql');
require('dotenv').config();

// 使用与 server.js 相同的数据库配置
const config = {
  user: process.env.DB_USER || 'sa',
  password: process.env.DB_PASSWORD || '123456',
  server: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'ContractDB',
  options: {
    encrypt: false,
    trustServerCertificate: true
  }
};

async function createAdmin() {
  let pool;
  try {
    console.log('连接数据库...', config);
    pool = await new sql.ConnectionPool(config).connect();
    console.log('数据库连接成功');
    
    const password = 'admin123';
    const hashedPwd = await bcrypt.hash(password, 10);
    console.log('生成的密码哈希:', hashedPwd);
    
    // 检查管理员是否存在
    const result = await pool.request()
      .query("SELECT id FROM users WHERE username = 'admin'");
    
    if (result.recordset.length > 0) {
      // 更新现有管理员密码
      await pool.request()
        .input('pwd', hashedPwd)
        .query("UPDATE users SET password_hash = @pwd WHERE username = 'admin'");
      console.log('管理员密码已更新');
    } else {
      // 创建新管理员
      await pool.request()
        .input('username', 'admin')
        .input('pwd', hashedPwd)
        .input('realName', '系统管理员')
        .input('role', 'admin')
        .query(`
          INSERT INTO users (username, password_hash, real_name, role, status, created_at, updated_at)
          VALUES (@username, @pwd, @realName, @role, 1, GETDATE(), GETDATE())
        `);
      console.log('管理员已创建');
    }
    
    // 验证
    const verify = await pool.request()
      .query("SELECT username, password_hash FROM users WHERE username = 'admin'");
    
    if (verify.recordset.length > 0) {
      const isValid = await bcrypt.compare('admin123', verify.recordset[0].password_hash);
      console.log('密码验证测试:', isValid ? '成功' : '失败');
    }
    
  } catch (err) {
    console.error('错误:', err);
  } finally {
    if (pool) await pool.close();
    process.exit(0);
  }
}

createAdmin();