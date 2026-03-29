const Database = require('./src/core/db');

async function test() {
  try {
    console.log('创建数据库连接...');
    const db = new Database();
    console.log('连接数据库...');
    await db.connect();
    console.log('连接成功');
    
    // 测试最简单的查询
    console.log('\n1. 测试简单查询:');
    const res1 = await db.query("SELECT 1 as test");
    console.log('结果:', res1);
    
    // 测试 contracts 表
    console.log('\n2. 测试 contracts 表:');
    const res2 = await db.query("SELECT COUNT(*) as cnt FROM contracts WHERE del = 0");
    console.log('contracts 数量:', res2);
    
    // 测试 suppliers 表
    console.log('\n3. 测试 suppliers 表:');
    const res3 = await db.query("SELECT COUNT(*) as cnt FROM suppliers WHERE del = 0");
    console.log('suppliers 数量:', res3);
    
    // 测试有 CASE WHEN 的查询
    console.log('\n4. 测试带 CASE WHEN 的查询:');
    const sql4 = `
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 1 THEN 1 ELSE 0 END) as pending
      FROM contracts WHERE del = 0
    `;
    const res4 = await db.query(sql4);
    console.log('结果:', res4);
    
    console.log('\n所有测试完成');
    
  } catch (err) {
    console.error('测试失败:', err);
  } finally {
    process.exit(0);
  }
}

test();