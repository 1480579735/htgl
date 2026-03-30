-- ============================================
-- 合同管理系统数据库结构
-- 创建数据库
-- ============================================

-- 创建数据库（如果不存在）
IF NOT EXISTS (SELECT * FROM sys.databases WHERE name = 'ContractDB')
BEGIN
    CREATE DATABASE ContractDB;
END
GO

USE ContractDB;
GO

-- ============================================
-- 1. 用户表
-- ============================================
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'users')
BEGIN
    CREATE TABLE users (
        id INT IDENTITY(1,1) PRIMARY KEY,
        username NVARCHAR(50) NOT NULL UNIQUE,
        password_hash NVARCHAR(255) NOT NULL,
        real_name NVARCHAR(50) NOT NULL,
        role NVARCHAR(20) NOT NULL DEFAULT 'user',
        status TINYINT NOT NULL DEFAULT 1,
        is_deleted BIT NOT NULL DEFAULT 0,
        deleted_at DATETIME NULL,
        created_at DATETIME NOT NULL DEFAULT GETDATE(),
        updated_at DATETIME NOT NULL DEFAULT GETDATE()
    );
    
    -- 添加索引
    CREATE INDEX idx_users_username ON users(username);
    CREATE INDEX idx_users_role ON users(role);
    CREATE INDEX idx_users_status ON users(status);
END
GO

-- ============================================
-- 2. 客户/供应商表（统一表）
-- ============================================
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'parties')
BEGIN
    CREATE TABLE parties (
        id INT IDENTITY(1,1) PRIMARY KEY,
        code NVARCHAR(50) NOT NULL UNIQUE,
        name NVARCHAR(100) NOT NULL,
        type NVARCHAR(20) NOT NULL,  -- 'customer' 或 'supplier'
        contact NVARCHAR(50) NULL,
        phone NVARCHAR(20) NULL,
        email NVARCHAR(100) NULL,
        address NVARCHAR(200) NULL,
        -- 客户专用字段
        risk_level TINYINT DEFAULT 0,  -- 0:正常, 1:关注, 2:高风险
        -- 供应商专用字段
        rating TINYINT DEFAULT 3,      -- 1-5星
        bank_name NVARCHAR(100) NULL,
        bank_account NVARCHAR(50) NULL,
        tax_number NVARCHAR(50) NULL,
        -- 通用字段
        status TINYINT NOT NULL DEFAULT 1,
        is_deleted BIT NOT NULL DEFAULT 0,
        deleted_at DATETIME NULL,
        created_at DATETIME NOT NULL DEFAULT GETDATE(),
        updated_at DATETIME NOT NULL DEFAULT GETDATE()
    );
    
    -- 添加索引
    CREATE INDEX idx_parties_code ON parties(code);
    CREATE INDEX idx_parties_name ON parties(name);
    CREATE INDEX idx_parties_type ON parties(type);
    CREATE INDEX idx_parties_risk ON parties(risk_level);
    CREATE INDEX idx_parties_rating ON parties(rating);
END
GO

-- ============================================
-- 3. 合同表
-- ============================================
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'contracts')
BEGIN
    CREATE TABLE contracts (
        id INT IDENTITY(1,1) PRIMARY KEY,
        code NVARCHAR(50) NOT NULL UNIQUE,
        title NVARCHAR(200) NOT NULL,
        type NVARCHAR(20) NOT NULL,  -- purchase, sales, service, lease
        direction TINYINT NOT NULL DEFAULT 1,  -- 1:销项, 2:进项
        amount DECIMAL(18,2) NOT NULL,
        currency NVARCHAR(3) NOT NULL DEFAULT 'CNY',
        party_id INT NOT NULL,
        party_name NVARCHAR(100) NOT NULL,
        status TINYINT NOT NULL DEFAULT 0,  -- 0:草稿,1:待批,2:生效,3:执行,4:完成,5:终止
        effective_date DATE NULL,
        expiry_date DATE NULL,
        terms NVARCHAR(MAX) NULL,
        attachments NVARCHAR(MAX) NULL,  -- JSON格式存储附件信息
        created_by INT NOT NULL,
        created_at DATETIME NOT NULL DEFAULT GETDATE(),
        updated_at DATETIME NOT NULL DEFAULT GETDATE(),
        is_deleted BIT NOT NULL DEFAULT 0,
        deleted_at DATETIME NULL,
        FOREIGN KEY (party_id) REFERENCES parties(id),
        FOREIGN KEY (created_by) REFERENCES users(id)
    );
    
    -- 添加索引
    CREATE INDEX idx_contracts_code ON contracts(code);
    CREATE INDEX idx_contracts_party ON contracts(party_id);
    CREATE INDEX idx_contracts_status ON contracts(status);
    CREATE INDEX idx_contracts_type ON contracts(type);
    CREATE INDEX idx_contracts_direction ON contracts(direction);
    CREATE INDEX idx_contracts_date ON contracts(effective_date, expiry_date);
    CREATE INDEX idx_contracts_created ON contracts(created_at);
END
GO

-- ============================================
-- 4. 付款计划表
-- ============================================
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'payments')
BEGIN
    CREATE TABLE payments (
        id INT IDENTITY(1,1) PRIMARY KEY,
        contract_id INT NOT NULL,
        stage NVARCHAR(100) NOT NULL,
        amount DECIMAL(18,2) NOT NULL,
        due_date DATE NOT NULL,
        type NVARCHAR(10) NOT NULL DEFAULT 'payment',  -- payment:付款, receipt:收款
        status TINYINT NOT NULL DEFAULT 0,  -- 0:待处理, 1:已完成
        actual_date DATE NULL,
        invoice_no NVARCHAR(50) NULL,
        invoice_path NVARCHAR(200) NULL,
        remark NVARCHAR(500) NULL,
        created_at DATETIME NOT NULL DEFAULT GETDATE(),
        is_deleted BIT NOT NULL DEFAULT 0,
        FOREIGN KEY (contract_id) REFERENCES contracts(id)
    );
    
    -- 添加索引
    CREATE INDEX idx_payments_contract ON payments(contract_id);
    CREATE INDEX idx_payments_due ON payments(due_date);
    CREATE INDEX idx_payments_status ON payments(status);
    CREATE INDEX idx_payments_type ON payments(type);
END
GO

-- ============================================
-- 5. 审批记录表
-- ============================================
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'approvals')
BEGIN
    CREATE TABLE approvals (
        id INT IDENTITY(1,1) PRIMARY KEY,
        contract_id INT NOT NULL,
        approver_id INT NOT NULL,
        result TINYINT NOT NULL,  -- 1:通过, 2:驳回
        remark NVARCHAR(500) NULL,
        created_at DATETIME NOT NULL DEFAULT GETDATE(),
        FOREIGN KEY (contract_id) REFERENCES contracts(id),
        FOREIGN KEY (approver_id) REFERENCES users(id)
    );
    
    -- 添加索引
    CREATE INDEX idx_approvals_contract ON approvals(contract_id);
    CREATE INDEX idx_approvals_approver ON approvals(approver_id);
END
GO

-- ============================================
-- 6. 操作日志表
-- ============================================
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'operation_logs')
BEGIN
    CREATE TABLE operation_logs (
        id INT IDENTITY(1,1) PRIMARY KEY,
        user_id INT NOT NULL,
        action NVARCHAR(50) NOT NULL,
        target_type NVARCHAR(50) NOT NULL,
        target_id INT NULL,
        detail NVARCHAR(MAX) NULL,
        ip_address NVARCHAR(50) NULL,
        created_at DATETIME NOT NULL DEFAULT GETDATE(),
        FOREIGN KEY (user_id) REFERENCES users(id)
    );
    
    -- 添加索引
    CREATE INDEX idx_logs_user ON operation_logs(user_id);
    CREATE INDEX idx_logs_action ON operation_logs(action);
    CREATE INDEX idx_logs_created ON operation_logs(created_at);
END
GO

-- ============================================
-- 7. 插入默认管理员账号
-- ============================================
-- 检查是否已有管理员
IF NOT EXISTS (SELECT * FROM users WHERE username = 'admin')
BEGIN
    -- 密码: admin123 (bcrypt 加密)
    INSERT INTO users (username, password_hash, real_name, role, status, created_at, updated_at)
    VALUES ('admin', '$2a$10$NkMqH5q7QvYyWxZxZxZxZu', '系统管理员', 'admin', 1, GETDATE(), GETDATE());
END
GO

-- ============================================
-- 8. 创建视图 - 合同汇总视图
-- ============================================
IF EXISTS (SELECT * FROM sys.views WHERE name = 'vw_contract_summary')
    DROP VIEW vw_contract_summary;
GO

CREATE VIEW vw_contract_summary AS
SELECT 
    c.id,
    c.code,
    c.title,
    c.type,
    c.direction,
    c.amount,
    c.currency,
    c.party_id,
    c.party_name,
    c.status,
    c.effective_date,
    c.expiry_date,
    c.terms,
    c.created_at,
    c.updated_at,
    u.username as created_by_name,
    -- 付款统计
    ISNULL(SUM(CASE WHEN p.type = 'receipt' AND p.status = 1 THEN p.amount ELSE 0 END), 0) as total_received,
    ISNULL(SUM(CASE WHEN p.type = 'payment' AND p.status = 1 THEN p.amount ELSE 0 END), 0) as total_paid,
    ISNULL(SUM(CASE WHEN p.type = 'receipt' AND p.status = 0 THEN p.amount ELSE 0 END), 0) as pending_receipt,
    ISNULL(SUM(CASE WHEN p.type = 'payment' AND p.status = 0 THEN p.amount ELSE 0 END), 0) as pending_payment,
    -- 逾期统计
    ISNULL(SUM(CASE WHEN p.status = 0 AND p.due_date < GETDATE() THEN 1 ELSE 0 END), 0) as overdue_count,
    -- 剩余天数
    CASE 
        WHEN c.status IN (2, 3) AND c.expiry_date IS NOT NULL 
        THEN DATEDIFF(DAY, GETDATE(), c.expiry_date)
        ELSE NULL 
    END as remaining_days
FROM contracts c
LEFT JOIN users u ON c.created_by = u.id
LEFT JOIN payments p ON c.id = p.contract_id AND p.is_deleted = 0
WHERE c.is_deleted = 0
GROUP BY c.id, c.code, c.title, c.type, c.direction, c.amount, c.currency, 
         c.party_id, c.party_name, c.status, c.effective_date, c.expiry_date, 
         c.terms, c.created_at, c.updated_at, u.username;
GO

-- ============================================
-- 9. 创建视图 - 供应商汇总视图
-- ============================================
IF EXISTS (SELECT * FROM sys.views WHERE name = 'vw_supplier_summary')
    DROP VIEW vw_supplier_summary;
GO

CREATE VIEW vw_supplier_summary AS
SELECT 
    p.id,
    p.code,
    p.name,
    p.contact,
    p.phone,
    p.email,
    p.address,
    p.rating,
    p.status,
    p.created_at,
    -- 合同统计
    COUNT(c.id) as total_contracts,
    SUM(CASE WHEN c.status IN (2, 3) THEN 1 ELSE 0 END) as active_contracts,
    ISNULL(SUM(CASE WHEN c.status IN (2, 3) THEN c.amount ELSE 0 END), 0) as active_amount,
    -- 付款统计
    ISNULL(SUM(CASE WHEN pay.type = 'payment' AND pay.status = 1 THEN pay.amount ELSE 0 END), 0) as paid_amount,
    ISNULL(SUM(CASE WHEN pay.type = 'payment' AND pay.status = 0 THEN pay.amount ELSE 0 END), 0) as pending_amount
FROM parties p
LEFT JOIN contracts c ON p.id = c.party_id AND c.is_deleted = 0
LEFT JOIN payments pay ON c.id = pay.contract_id AND pay.is_deleted = 0
WHERE p.type = 'supplier' AND p.is_deleted = 0
GROUP BY p.id, p.code, p.name, p.contact, p.phone, p.email, p.address, p.rating, p.status, p.created_at;
GO

-- ============================================
-- 10. 创建视图 - 客户汇总视图
-- ============================================
IF EXISTS (SELECT * FROM sys.views WHERE name = 'vw_customer_summary')
    DROP VIEW vw_customer_summary;
GO

CREATE VIEW vw_customer_summary AS
SELECT 
    p.id,
    p.code,
    p.name,
    p.contact,
    p.phone,
    p.email,
    p.address,
    p.risk_level,
    p.status,
    p.created_at,
    -- 合同统计
    COUNT(c.id) as total_contracts,
    SUM(CASE WHEN c.status IN (2, 3) THEN 1 ELSE 0 END) as active_contracts,
    ISNULL(SUM(CASE WHEN c.status IN (2, 3) THEN c.amount ELSE 0 END), 0) as active_amount,
    -- 收款统计
    ISNULL(SUM(CASE WHEN pay.type = 'receipt' AND pay.status = 1 THEN pay.amount ELSE 0 END), 0) as received_amount,
    ISNULL(SUM(CASE WHEN pay.type = 'receipt' AND pay.status = 0 THEN pay.amount ELSE 0 END), 0) as pending_amount
FROM parties p
LEFT JOIN contracts c ON p.id = c.party_id AND c.is_deleted = 0
LEFT JOIN payments pay ON c.id = pay.contract_id AND pay.is_deleted = 0
WHERE p.type = 'customer' AND p.is_deleted = 0
GROUP BY p.id, p.code, p.name, p.contact, p.phone, p.email, p.address, p.risk_level, p.status, p.created_at;
GO

-- ============================================
-- 11. 创建存储过程 - 获取仪表盘统计数据
-- ============================================
IF EXISTS (SELECT * FROM sys.procedures WHERE name = 'sp_get_dashboard_stats')
    DROP PROCEDURE sp_get_dashboard_stats;
GO

CREATE PROCEDURE sp_get_dashboard_stats
AS
BEGIN
    SET NOCOUNT ON;
    
    -- 合同统计
    SELECT 
        COUNT(*) as total_contracts,
        SUM(CASE WHEN status = 1 THEN 1 ELSE 0 END) as pending_approval,
        SUM(CASE WHEN status = 2 THEN 1 ELSE 0 END) as active_contracts,
        SUM(CASE WHEN status = 3 THEN 1 ELSE 0 END) as executing_contracts,
        SUM(CASE WHEN status = 4 THEN 1 ELSE 0 END) as completed_contracts,
        SUM(CASE WHEN status = 5 THEN 1 ELSE 0 END) as terminated_contracts,
        ISNULL(SUM(CASE WHEN status IN (2,3) THEN amount ELSE 0 END), 0) as active_amount,
        ISNULL(AVG(CASE WHEN status IN (2,3) THEN amount ELSE NULL END), 0) as avg_amount
    FROM contracts
    WHERE is_deleted = 0;
    
    -- 客户统计
    SELECT 
        COUNT(*) as total_customers,
        SUM(CASE WHEN risk_level = 0 THEN 1 ELSE 0 END) as normal_risk,
        SUM(CASE WHEN risk_level = 1 THEN 1 ELSE 0 END) as concern_risk,
        SUM(CASE WHEN risk_level = 2 THEN 1 ELSE 0 END) as high_risk,
        SUM(CASE WHEN status = 1 THEN 1 ELSE 0 END) as active_customers
    FROM parties
    WHERE type = 'customer' AND is_deleted = 0;
    
    -- 供应商统计
    SELECT 
        COUNT(*) as total_suppliers,
        AVG(rating) as avg_rating,
        SUM(CASE WHEN rating >= 4 THEN 1 ELSE 0 END) as high_rating,
        SUM(CASE WHEN status = 1 THEN 1 ELSE 0 END) as active_suppliers
    FROM parties
    WHERE type = 'supplier' AND is_deleted = 0;
    
    -- 付款统计
    SELECT 
        SUM(CASE WHEN type = 'receipt' AND status = 0 THEN amount ELSE 0 END) as pending_receipt,
        SUM(CASE WHEN type = 'payment' AND status = 0 THEN amount ELSE 0 END) as pending_payment,
        SUM(CASE WHEN type = 'receipt' AND status = 0 AND due_date < GETDATE() THEN amount ELSE 0 END) as overdue_receipt,
        SUM(CASE WHEN type = 'payment' AND status = 0 AND due_date < GETDATE() THEN amount ELSE 0 END) as overdue_payment
    FROM payments
    WHERE is_deleted = 0;
END
GO

-- ============================================
-- 12. 创建存储过程 - 获取合同统计数据
-- ============================================
IF EXISTS (SELECT * FROM sys.procedures WHERE name = 'sp_get_contract_stats')
    DROP PROCEDURE sp_get_contract_stats;
GO

CREATE PROCEDURE sp_get_contract_stats
    @start_date DATE = NULL,
    @end_date DATE = NULL
AS
BEGIN
    SET NOCOUNT ON;
    
    IF @start_date IS NULL SET @start_date = DATEADD(YEAR, -1, GETDATE());
    IF @end_date IS NULL SET @end_date = GETDATE();
    
    -- 按月统计
    SELECT 
        YEAR(created_at) as year,
        MONTH(created_at) as month,
        COUNT(*) as contract_count,
        SUM(amount) as total_amount,
        AVG(amount) as avg_amount
    FROM contracts
    WHERE created_at BETWEEN @start_date AND @end_date
        AND is_deleted = 0
    GROUP BY YEAR(created_at), MONTH(created_at)
    ORDER BY year DESC, month DESC;
    
    -- 按类型统计
    SELECT 
        type,
        COUNT(*) as contract_count,
        SUM(amount) as total_amount,
        AVG(amount) as avg_amount
    FROM contracts
    WHERE is_deleted = 0
    GROUP BY type;
    
    -- 按状态统计
    SELECT 
        status,
        COUNT(*) as contract_count,
        SUM(amount) as total_amount
    FROM contracts
    WHERE is_deleted = 0
    GROUP BY status;
END
GO

-- ============================================
-- 打印创建结果
-- ============================================
SELECT 'Database schema created successfully!' as Status;
SELECT 
    'Tables' as ObjectType,
    COUNT(*) as Count
FROM INFORMATION_SCHEMA.TABLES 
WHERE TABLE_TYPE = 'BASE TABLE'
UNION ALL
SELECT 
    'Views' as ObjectType,
    COUNT(*) as Count
FROM INFORMATION_SCHEMA.VIEWS
UNION ALL
SELECT 
    'Stored Procedures' as ObjectType,
    COUNT(*) as Count
FROM sys.procedures;
GO