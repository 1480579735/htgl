USE ContractDB;
GO

-- 1. 清理现有数据（可选，谨慎使用）
-- 注意：这会删除所有现有数据，请根据需要执行
-- DELETE FROM payments;
-- DELETE FROM contracts;
-- DELETE FROM parties;
-- DELETE FROM users WHERE username != 'admin';
-- GO

-- 2. 插入示例客户数据
INSERT INTO parties (code, name, type, contact, phone, email, address, risk_level, status, created_at, updated_at) VALUES
('CUST001', 'XX科技有限公司', 'customer', '张三', '13800138001', 'zhang@xxtech.com', '北京市朝阳区科技园A座', 0, 1, GETDATE(), GETDATE()),
('CUST002', 'YY贸易有限公司', 'customer', '李四', '13800138002', 'li@yytrade.com', '上海市浦东新区世纪大道100号', 1, 1, GETDATE(), GETDATE()),
('CUST003', 'ZZ制造厂', 'customer', '王五', '13800138003', 'wang@zzfactory.com', '广州市天河区工业园B区', 2, 1, GETDATE(), GETDATE()),
('CUST004', 'AA信息技术公司', 'customer', '赵六', '13800138004', 'zhao@aatech.com', '深圳市南山区科技园C栋', 0, 1, GETDATE(), GETDATE()),
('CUST005', 'BB咨询服务有限公司', 'customer', '孙七', '13800138005', 'sun@bbconsult.com', '成都市高新区天府软件园', 0, 1, GETDATE(), GETDATE());
GO

-- 3. 插入示例供应商数据
INSERT INTO parties (code, name, type, contact, phone, email, address, rating, status, created_at, updated_at) VALUES
('SUP001', 'XX科技供应商', 'supplier', '王经理', '13800138101', 'wang@xxsupply.com', '北京市海淀区中关村', 5, 1, GETDATE(), GETDATE()),
('SUP002', 'YY材料有限公司', 'supplier', '李主管', '13800138102', 'li@yymaterial.com', '上海市松江区工业区', 4, 1, GETDATE(), GETDATE()),
('SUP003', 'ZZ设备制造厂', 'supplier', '张厂长', '13800138103', 'zhang@zzmachine.com', '广州市番禺区工业园', 3, 1, GETDATE(), GETDATE()),
('SUP004', 'AA电子元器件公司', 'supplier', '陈经理', '13800138104', 'chen@aacomponents.com', '深圳市福田区电子市场', 5, 1, GETDATE(), GETDATE()),
('SUP005', 'BB包装材料厂', 'supplier', '周主管', '13800138105', 'zhou@bbpack.com', '东莞市长安镇工业区', 4, 1, GETDATE(), GETDATE());
GO

-- 4. 插入示例合同数据
-- 销售合同（销项）
INSERT INTO contracts (code, title, type, direction, amount, party_id, party_name, status, effective_date, expiry_date, terms, created_by, created_at, updated_at) VALUES
('CT202403001', 'ERP系统采购合同', 'purchase', 2, 280000, 1, 'XX科技有限公司', 3, '2024-03-01', '2025-02-28', '采购ERP系统一套，包含财务、采购、销售、库存等模块，合同签订后支付30%预付款，系统上线后支付50%，验收合格后支付20%尾款。', 1, DATEADD(DAY, -30, GETDATE()), GETDATE(), GETDATE()),
('CT202403002', 'CRM软件销售合同', 'sales', 1, 150000, 2, 'YY贸易有限公司', 2, '2024-03-15', '2024-12-31', '销售CRM客户关系管理系统，包含客户管理、销售管理、报表分析等模块，提供一年免费维护。', 1, DATEADD(DAY, -15, GETDATE()), GETDATE(), GETDATE()),
('CT202403003', '年度技术维护服务', 'service', 1, 48000, 3, 'ZZ制造厂', 1, '2024-04-01', '2025-03-31', '年度技术维护服务，包含系统巡检、技术支持、故障处理等内容，每月提供一次现场巡检。', 1, DATEADD(DAY, -5, GETDATE()), GETDATE(), GETDATE()),
('CT202403004', '服务器硬件采购合同', 'purchase', 2, 120000, 4, 'AA信息技术公司', 0, '2024-03-20', '2024-06-30', '采购服务器10台，配置：CPU 16核，内存64GB，硬盘2TB。', 1, GETDATE(), GETDATE(), GETDATE()),
('CT202403005', '云计算服务合同', 'service', 1, 88000, 5, 'BB咨询服务有限公司', 2, '2024-03-10', '2025-03-09', '提供云服务器、云数据库、对象存储等服务，按年付费。', 1, DATEADD(DAY, -20, GETDATE()), GETDATE(), GETDATE()),
('CT202403006', 'ERP系统二期开发合同', 'service', 1, 200000, 1, 'XX科技有限公司', 3, '2024-02-01', '2024-07-31', 'ERP系统二期开发，包含移动端应用、数据分析模块、接口集成等。', 1, DATEADD(DAY, -58, GETDATE()), GETDATE(), GETDATE()),
('CT202403007', '办公设备采购合同', 'purchase', 2, 35000, 2, 'YY贸易有限公司', 4, '2024-01-15', '2024-03-31', '采购打印机、复印机、投影仪等办公设备一批。', 1, DATEADD(DAY, -75, GETDATE()), GETDATE(), GETDATE()),
('CT202403008', '软件定制开发合同', 'service', 1, 300000, 3, 'ZZ制造厂', 5, '2024-01-01', '2024-12-31', '定制开发生产管理系统，包含生产计划、物料管理、质量控制等模块。', 1, DATEADD(DAY, -89, GETDATE()), GETDATE(), GETDATE());
GO

-- 5. 插入付款计划数据
-- 合同1的付款计划（ERP系统采购）
INSERT INTO payments (contract_id, stage, amount, due_date, type, status, created_at) VALUES
(1, '预付款', 84000, '2024-03-15', 'payment', 1, GETDATE()),
(1, '进度款', 140000, '2024-05-01', 'payment', 0, GETDATE()),
(1, '尾款', 56000, '2024-07-01', 'payment', 0, GETDATE());

-- 合同2的付款计划（CRM软件销售）
INSERT INTO payments (contract_id, stage, amount, due_date, type, status, created_at) VALUES
(2, '预付款', 45000, '2024-03-20', 'receipt', 0, GETDATE()),
(2, '验收款', 75000, '2024-04-15', 'receipt', 0, GETDATE()),
(2, '尾款', 30000, '2024-05-30', 'receipt', 0, GETDATE());

-- 合同3的付款计划（技术维护服务）
INSERT INTO payments (contract_id, stage, amount, due_date, type, status, created_at) VALUES
(3, '年度服务费', 48000, '2024-04-01', 'receipt', 0, GETDATE());

-- 合同4的付款计划（服务器硬件采购）
INSERT INTO payments (contract_id, stage, amount, due_date, type, status, created_at) VALUES
(4, '预付款', 36000, '2024-03-25', 'payment', 0, GETDATE()),
(4, '发货款', 60000, '2024-04-10', 'payment', 0, GETDATE()),
(4, '验收款', 24000, '2024-05-10', 'payment', 0, GETDATE());

-- 合同5的付款计划（云计算服务）
INSERT INTO payments (contract_id, stage, amount, due_date, type, status, created_at) VALUES
(5, '首年服务费', 88000, '2024-03-20', 'receipt', 0, GETDATE());

-- 合同6的付款计划（ERP二期开发）
INSERT INTO payments (contract_id, stage, amount, due_date, type, status, created_at) VALUES
(6, '启动款', 60000, '2024-02-15', 'receipt', 1, GETDATE()),
(6, '中期款', 80000, '2024-04-15', 'receipt', 0, GETDATE()),
(6, '验收款', 60000, '2024-06-30', 'receipt', 0, GETDATE());

-- 合同7的付款计划（办公设备采购）
INSERT INTO payments (contract_id, stage, amount, due_date, type, status, created_at) VALUES
(7, '全款', 35000, '2024-02-15', 'payment', 1, GETDATE());

-- 合同8的付款计划（软件定制开发）
INSERT INTO payments (contract_id, stage, amount, due_date, type, status, created_at) VALUES
(8, '预付款', 90000, '2024-01-15', 'receipt', 1, GETDATE()),
(8, '中期款', 120000, '2024-04-15', 'receipt', 0, GETDATE()),
(8, '尾款', 90000, '2024-09-30', 'receipt', 0, GETDATE());
GO

-- 6. 插入审批记录
INSERT INTO approvals (contract_id, approver_id, result, remark, created_at) VALUES
(1, 1, 1, '审批通过，同意采购', DATEADD(DAY, -25, GETDATE())),
(2, 1, 1, '审批通过，客户资质良好', DATEADD(DAY, -10, GETDATE())),
(6, 1, 1, '同意开发', DATEADD(DAY, -55, GETDATE())),
(7, 1, 1, '采购申请批准', DATEADD(DAY, -70, GETDATE()));
GO

-- 7. 插入操作日志
INSERT INTO operation_logs (user_id, action, target_type, target_id, detail, created_at) VALUES
(1, 'CREATE', 'contract', 1, '创建合同: CT202403001', DATEADD(DAY, -30, GETDATE())),
(1, 'APPROVE', 'contract', 1, '审批通过合同: CT202403001', DATEADD(DAY, -25, GETDATE())),
(1, 'START', 'contract', 1, '开始执行合同: CT202403001', DATEADD(DAY, -20, GETDATE())),
(1, 'CREATE', 'contract', 2, '创建合同: CT202403002', DATEADD(DAY, -15, GETDATE())),
(1, 'APPROVE', 'contract', 2, '审批通过合同: CT202403002', DATEADD(DAY, -10, GETDATE())),
(1, 'CREATE', 'contract', 3, '创建合同: CT202403003', DATEADD(DAY, -5, GETDATE())),
(1, 'CREATE', 'contract', 4, '创建合同: CT202403004', GETDATE()),
(1, 'CREATE', 'payment', 1, '创建付款计划: 合同CT202403001预付款', DATEADD(DAY, -28, GETDATE())),
(1, 'PAY', 'payment', 1, '记录付款: 合同CT202403001预付款', DATEADD(DAY, -27, GETDATE()));
GO

-- 8. 查看数据统计
SELECT '数据统计' as Info;
SELECT COUNT(*) as 用户数 FROM users;
SELECT COUNT(*) as 客户数 FROM parties WHERE type = 'customer';
SELECT COUNT(*) as 供应商数 FROM parties WHERE type = 'supplier';
SELECT COUNT(*) as 合同数 FROM contracts;
SELECT COUNT(*) as 付款计划数 FROM payments;
SELECT 
    SUM(CASE WHEN status = 0 THEN 1 ELSE 0 END) as 草稿,
    SUM(CASE WHEN status = 1 THEN 1 ELSE 0 END) as 待批,
    SUM(CASE WHEN status = 2 THEN 1 ELSE 0 END) as 生效,
    SUM(CASE WHEN status = 3 THEN 1 ELSE 0 END) as 执行,
    SUM(CASE WHEN status = 4 THEN 1 ELSE 0 END) as 完成,
    SUM(CASE WHEN status = 5 THEN 1 ELSE 0 END) as 终止
FROM contracts;
GO

-- 9. 查看即将到期合同（30天内）
SELECT '即将到期合同（30天内）' as Info;
SELECT code, title, party_name, expiry_date, 
       DATEDIFF(DAY, GETDATE(), expiry_date) as 剩余天数
FROM contracts 
WHERE status IN (2, 3) 
  AND expiry_date BETWEEN GETDATE() AND DATEADD(DAY, 30, GETDATE())
ORDER BY expiry_date ASC;
GO

-- 10. 查看逾期付款
SELECT '逾期付款' as Info;
SELECT p.stage, p.amount, p.due_date, c.code as 合同编号, c.title as 合同名称
FROM payments p
JOIN contracts c ON p.contract_id = c.id
WHERE p.status = 0 AND p.due_date < GETDATE();
GO