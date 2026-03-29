import React, { useState } from 'react';
import api from '../core/api';
import Sidebar from './sidebar';
import './main.css';

export default function MainLayout({ children, user, currentPath, onNavigate }) {
  const [collapsed, setCollapsed] = useState(false);
  
  const logout = () => {
    if (window.confirm('确定要退出登录吗？')) {
      api.setToken(null);
      window.location.href = '/login';
    }
  };
  
  return (
    <div className="app-layout">
      <Sidebar 
        collapsed={collapsed} 
        currentPath={currentPath} 
        onNavigate={onNavigate} 
      />
      
      <div className={`main-container ${collapsed ? 'sidebar-collapsed' : ''}`}>
        <header className="app-header">
          <div className="header-left">
            <button className="collapse-btn" onClick={() => setCollapsed(!collapsed)}>
              ☰
            </button>
            <div className="system-title">合同管理系统</div>
          </div>
          <div className="header-right">
            <div className="user-info">
              <span className="user-icon">👤</span>
              <span className="user-name">{user?.realName || user?.name || '用户'}</span>
              <span className="user-role">{user?.role === 'admin' ? '管理员' : '普通用户'}</span>
            </div>
            <button className="logout-btn" onClick={logout}>
              <span>🚪</span>
              <span>退出登录</span>
            </button>
          </div>
        </header>
        <main className="app-content">
          {children}
        </main>
      </div>
    </div>
  );
}