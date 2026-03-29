const bcrypt = require('bcryptjs');
const sql = require('mssql');
const config = require('./src/config');

async function createAdmin() {
  let pool = null;
  try {
    console.log('连接数据库...');
    pool = await new sql.ConnectionPool(config.db).connect();
    console.log('数据库连接成功');
    
    // 检查表是否存在
    const tables = await pool.request().query(`
      SELECT COUNT(*) as cnt FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_NAME = 'users'
    `);
    
    if (tables.recordset[0].cnt === 0) {
      console.error('users 表不存在，请先执行 schema.sql');
      return;
    }
    
    // 检查是否有用户
    const users = await pool.request().query("SELECT * FROM users");
    console.log('当前用户数:', users.recordset.length);
    
    if (users.recordset.length > 0) {
      console.log('现有用户:');
      users.recordset.forEach(u => {
        console.log(`  ID:${u.id} 用户名:${u.name} 角色:${u.role}`);
      });
      
      // 更新 admin 密码
      const hashedPwd = await bcrypt.hash('admin123', 10);
      await pool.request()
        .input('pwd', hashedPwd)
        .input('name', 'admin')
        .query("UPDATE users SET pwd = @pwd WHERE name = @name");
      console.log('已更新 admin 密码');
    } else {
      // 创建管理员
      const hashedPwd = await bcrypt.hash('admin123', 10);
      await pool.request()
        .input('name', 'admin')
        .input('pwd', hashedPwd)
        .input('realName', '系统管理员')
        .input('role', 'admin')
        .query(`
          INSERT INTO users (name, pwd, real_name, role, status, created_at, updated_at) 
          VALUES (@name, @pwd, @realName, @role, 1, GETDATE(), GETDATE())
        `);
      console.log('已创建管理员账号');
    }
    
    // 验证
    const verify = await pool.request()
      .input('name', 'admin')
      .query("SELECT * FROM users WHERE name = @name");
    
    if (verify.recordset.length > 0) {
      const isValid = await bcrypt.compare('admin123', verify.recordset[0].pwd);
      console.log('\n验证结果:');
      console.log(`  用户名: ${verify.recordset[0].name}`);
      console.log(`  角色: ${verify.recordset[0].role}`);
      console.log(`  密码验证: ${isValid ? '成功' : '失败'}`);
      
      if (isValid) {
        console.log('\n✓ 可以使用 admin / admin123 登录');
      }
    }
    
  } catch (err) {
    console.error('错误:', err);
  } finally {
    if (pool) await pool.close();
  }
}

createAdmin();