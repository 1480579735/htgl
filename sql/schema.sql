-- 合同管理系统数据库脚本
-- 创建数据库
CREATE DATABASE ContractDB;
GO

USE ContractDB;
GO

-- 用户表
CREATE TABLE users (
  id INT IDENTITY(1,1) PRIMARY KEY,
  name NVARCHAR(50) NOT NULL UNIQUE,
  pwd NVARCHAR(200) NOT NULL,
  real_name NVARCHAR(50) NOT NULL,
  role NVARCHAR(20) DEFAULT 'user',
  status TINYINT DEFAULT 1,
  created_at DATETIME DEFAULT GETDATE(),
  updated_at DATETIME DEFAULT GETDATE(),
  del BIT DEFAULT 0,
  deleted_at DATETIME
);

-- 客户表
CREATE TABLE customers (
  id INT IDENTITY(1,1) PRIMARY KEY,
  code NVARCHAR(50) NOT NULL UNIQUE,
  name NVARCHAR(100) NOT NULL,
  contact NVARCHAR(50),
  phone NVARCHAR(20),
  email NVARCHAR(100),
  address NVARCHAR(200),
  risk TINYINT DEFAULT 0,
  created_at DATETIME DEFAULT GETDATE(),
  updated_at DATETIME DEFAULT GETDATE(),
  del BIT DEFAULT 0,
  deleted_at DATETIME
);

-- 合同表
CREATE TABLE contracts (
  id INT IDENTITY(1,1) PRIMARY KEY,
  code NVARCHAR(50) NOT NULL UNIQUE,
  name NVARCHAR(200) NOT NULL,
  type NVARCHAR(20) NOT NULL,
  amount DECIMAL(18,2) NOT NULL,
  cust_id INT NOT NULL,
  cust_name NVARCHAR(100) NOT NULL,
  status TINYINT DEFAULT 0,
  sign_date DATE,
  start_date DATE,
  end_date DATE,
  content NVARCHAR(MAX),
  created_by INT,
  created_at DATETIME DEFAULT GETDATE(),
  updated_at DATETIME DEFAULT GETDATE(),
  del BIT DEFAULT 0,
  deleted_at DATETIME,
  FOREIGN KEY (cust_id) REFERENCES customers(id),
  FOREIGN KEY (created_by) REFERENCES users(id)
);

-- 付款表
CREATE TABLE payments (
  id INT IDENTITY(1,1) PRIMARY KEY,
  contract_id INT NOT NULL,
  stage NVARCHAR(100) NOT NULL,
  amount DECIMAL(18,2) NOT NULL,
  due_date DATE NOT NULL,
  type NVARCHAR(10) NOT NULL,
  status TINYINT DEFAULT 0,
  actual_date DATE,
  invoice_no NVARCHAR(50),
  invoice_path NVARCHAR(200),
  remark NVARCHAR(500),
  created_at DATETIME DEFAULT GETDATE(),
  FOREIGN KEY (contract_id) REFERENCES contracts(id)
);

-- 审批表
CREATE TABLE approvals (
  id INT IDENTITY(1,1) PRIMARY KEY,
  contract_id INT NOT NULL,
  user_id INT NOT NULL,
  result TINYINT,
  remark NVARCHAR(500),
  created_at DATETIME DEFAULT GETDATE(),
  FOREIGN KEY (contract_id) REFERENCES contracts(id),
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- 操作日志表
CREATE TABLE logs (
  id INT IDENTITY(1,1) PRIMARY KEY,
  user_id INT,
  action NVARCHAR(50),
  target NVARCHAR(100),
  detail NVARCHAR(MAX),
  ip NVARCHAR(50),
  created_at DATETIME DEFAULT GETDATE(),
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- 创建索引
CREATE INDEX idx_contracts_code ON contracts(code);
CREATE INDEX idx_contracts_cust ON contracts(cust_id);
CREATE INDEX idx_contracts_status ON contracts(status);
CREATE INDEX idx_contracts_date ON contracts(start_date, end_date);
CREATE INDEX idx_payments_contract ON payments(contract_id);
CREATE INDEX idx_payments_due ON payments(due_date);
CREATE INDEX idx_customers_name ON customers(name);
CREATE INDEX idx_customers_code ON customers(code);

-- 插入初始数据
-- 密码: admin123 (bcrypt加密)
INSERT INTO users (name, pwd, real_name, role, status) VALUES
('admin', '$2a$10$NkMqH5q7QvYyWxZxZxZxZu', '系统管理员', 'admin', 1);

-- 供应商表
CREATE TABLE suppliers (
  id INT IDENTITY(1,1) PRIMARY KEY,
  code NVARCHAR(50) NOT NULL UNIQUE,
  name NVARCHAR(100) NOT NULL,
  contact NVARCHAR(50),
  phone NVARCHAR(20),
  email NVARCHAR(100),
  address NVARCHAR(200),
  bank_name NVARCHAR(100),
  bank_account NVARCHAR(50),
  tax_no NVARCHAR(50),
  rating TINYINT DEFAULT 3,
  status TINYINT DEFAULT 1,
  created_at DATETIME DEFAULT GETDATE(),
  updated_at DATETIME DEFAULT GETDATE(),
  del BIT DEFAULT 0,
  deleted_at DATETIME
);

-- 创建供应商索引
CREATE INDEX idx_suppliers_code ON suppliers(code);
CREATE INDEX idx_suppliers_name ON suppliers(name);
CREATE INDEX idx_suppliers_rating ON suppliers(rating);
CREATE INDEX idx_suppliers_status ON suppliers(status);

-- 插入测试供应商数据
INSERT INTO suppliers (code, name, contact, phone, email, address, bank_name, bank_account, tax_no, rating, status) VALUES
('SUP001', 'XX科技供应商', '王经理', '13800138001', 'wang@xxsupply.com', '北京市海淀区', '中国银行北京分行', '6217000012345678', '91110108MA001234X', 5, 1),
('SUP002', 'YY材料有限公司', '李主管', '13800138002', 'li@yymaterial.com', '上海市浦东新区', '工商银行上海分行', '6222000012345678', '91310115MA001235Y', 4, 1),
('SUP003', 'ZZ设备制造厂', '张厂长', '13800138003', 'zhang@zzmachine.com', '广州市天河区', '建设银行广州分行', '6236000012345678', '91440101MA001236Z', 3, 1);