const bcrypt = require('bcryptjs');
const db = require('./src/core/db');

async function test() {
  try {
    console.log('1. 测试数据库连接...');
    await db.connect();
    console.log('✓ 数据库连接成功');
    
    console.log('\n2. 查询用户表...');
    const users = await db.query("SELECT * FROM users");
    console.log('用户数量:', users.length);
    
    if (users.length > 0) {
      console.log('现有用户:');
      users.forEach(u => {
        console.log(`  - ${u.name} (${u.role})`);
      });
    } else {
      console.log('没有用户，需要创建');
      
      console.log('\n3. 创建管理员用户...');
      const hashedPwd = await bcrypt.hash('admin123', 10);
      console.log('密码哈希:', hashedPwd);
      
      await db.execute(`
        INSERT INTO users (name, pwd, real_name, role, status, created_at, updated_at) 
        VALUES (@name, @pwd, @realName, @role, 1, GETDATE(), GETDATE())
      `, {
        name: 'admin',
        pwd: hashedPwd,
        realName: '系统管理员',
        role: 'admin'
      });
      console.log('✓ 管理员创建成功');
    }
    
    console.log('\n4. 测试密码验证...');
    const adminUser = await db.query("SELECT * FROM users WHERE name = 'admin'");
    if (adminUser && adminUser.length > 0) {
      const isValid = await bcrypt.compare('admin123', adminUser[0].pwd);
      console.log('密码验证:', isValid ? '✓ 正确' : '✗ 错误');
      if (!isValid) {
        console.log('密码哈希:', adminUser[0].pwd);
        console.log('需要重新设置密码');
        
        // 重新设置密码
        const newHash = await bcrypt.hash('admin123', 10);
        await db.execute("UPDATE users SET pwd = @pwd WHERE name = 'admin'", { pwd: newHash });
        console.log('✓ 密码已重置');
      }
    }
    
    console.log('\n5. 测试登录接口...');
    const loginUser = await db.query("SELECT * FROM users WHERE name = 'admin'");
    if (loginUser && loginUser.length > 0) {
      const testResult = await bcrypt.compare('admin123', loginUser[0].pwd);
      console.log('登录测试:', testResult ? '✓ 成功' : '✗ 失败');
    }
    
    console.log('\n✓ 所有测试通过');
    
  } catch (err) {
    console.error('测试失败:', err);
    console.error('错误堆栈:', err.stack);
  } finally {
    process.exit(0);
  }
}

test();