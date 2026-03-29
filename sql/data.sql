-- 测试数据

-- 插入客户
INSERT INTO customers (code, name, contact, phone, email, address, risk) VALUES
('CUST001', 'XX科技有限公司', '张三', '13800138001', 'zhang@xx.com', '北京市朝阳区', 0),
('CUST002', 'YY贸易有限公司', '李四', '13800138002', 'li@yy.com', '上海市浦东区', 0),
('CUST003', 'ZZ制造厂', '王五', '13800138003', 'wang@zz.com', '广州市天河区', 1);

-- 插入合同
INSERT INTO contracts (code, name, type, amount, cust_id, cust_name, status, sign_date, start_date, end_date, content) VALUES
('CT2024010001', 'ERP系统采购合同', 'purchase', 280000, 1, 'XX科技有限公司', 3, '2024-01-10', '2024-02-01', '2025-01-31', '采购ERP系统一套'),
('CT2024010002', '软件销售合同', 'sales', 150000, 2, 'YY贸易有限公司', 2, '2024-01-15', '2024-02-01', '2024-12-31', '销售CRM软件许可'),
('CT2024020003', '技术维护服务', 'service', 48000, 3, 'ZZ制造厂', 1, '2024-02-01', '2024-03-01', '2025-02-28', '年度技术维护服务');

-- 插入付款计划
INSERT INTO payments (contract_id, stage, amount, due_date, type, status) VALUES
(1, '预付款', 84000, '2024-02-01', 'receipt', 1),
(1, '验收款', 140000, '2024-04-01', 'receipt', 0),
(1, '尾款', 56000, '2024-07-01', 'receipt', 0),
(2, '首付款', 45000, '2024-02-01', 'payment', 0),
(2, '验收款', 75000, '2024-03-01', 'payment', 0),
(2, '尾款', 30000, '2024-04-01', 'payment', 0),
(3, '服务费', 48000, '2024-03-01', 'receipt', 0);