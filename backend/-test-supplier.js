const container = require('./src/config/container');

async function testSupplier() {
  try {
    console.log('测试供应商模块...');
    
    const supplierService = container.get('supplierService');
    
    // 测试列表
    console.log('\n1. 测试获取供应商列表...');
    const list = await supplierService.list({}, 1, 10);
    console.log('结果:', list);
    
    // 测试统计
    console.log('\n2. 测试获取统计...');
    const stats = await supplierService.getStats();
    console.log('统计:', stats);
    
    // 测试创建
    console.log('\n3. 测试创建供应商...');
    const newSupplier = await supplierService.create({
      name: '测试供应商',
      contact: '测试联系人',
      phone: '13800138000',
      email: 'test@test.com',
      rating: 4
    }, 1);
    console.log('创建结果:', newSupplier);
    
  } catch (err) {
    console.error('测试失败:', err);
  }
}

testSupplier();