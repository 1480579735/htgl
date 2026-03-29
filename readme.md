# 合同管理系统

企业级合同管理系统，支持合同全生命周期管理。

## 功能特性

- 合同管理：创建、编辑、删除、查询
- 合同状态流转：草稿 → 待审批 → 生效 → 执行 → 完成/终止
- 客户管理：客户信息维护、风险等级管理
- 收付款管理：付款计划、收款记录、发票管理
- 审批流程：多级审批、审批记录
- 仪表盘：数据统计、到期提醒

## 技术栈

### 后端
- Node.js + Express
- SQL Server
- JWT 认证
- 分层架构 (API / Domain / Repository)

### 前端
- React 18
- 状态管理 (自研 Store)
- Vite 构建
- 模块化组件

## 快速开始

### 环境要求
- Node.js 18+
- SQL Server 2019+
- Docker (可选)

### 本地开发

1. 安装依赖
```bash
# 后端
cd backend
npm install

# 前端
cd frontend
npm install