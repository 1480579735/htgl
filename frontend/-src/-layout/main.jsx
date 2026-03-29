import React, { useState } from 'react';
import api from '../core/api';
import Sidebar from './sidebar';

export default function MainLayout({ children, user, currentPath, onNavigate }) {
  const [collapsed, setCollapsed] = useState(false);
  
  const logout = () => {
    api.setToken(null);
    window.location.href = '/login';
  };
  
  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <div style={{ width: collapsed ? 70 : 260, background: '#2c3e50', color: 'white', transition: 'width 0.3s' }}>
        <div style={{ padding: 20, textAlign: 'center', borderBottom: '1px solid #34495e' }}>
          {collapsed ? 'CMS' : '合同管理系统'}
        </div>
        <div style={{ padding: '20px 0' }}>
          <div style={{ padding: '12px 20px', cursor: 'pointer', background: currentPath === '/' ? '#3498db' : 'transparent' }} onClick={() => onNavigate('/')}>
            📊 {!collapsed && '仪表盘'}
          </div>
        </div>
        <div style={{ padding: 20, borderTop: '1px solid #34495e', marginTop: 'auto' }}>
          <div style={{ marginBottom: 15 }}>👤 {!collapsed && (user?.realName || user?.name || '用户')}</div>
          <button onClick={logout} style={{ width: '100%', padding: 8, background: 'transparent', color: 'white', border: '1px solid #34495e', borderRadius: 4, cursor: 'pointer' }}>
            🚪 {!collapsed && '退出'}
          </button>
        </div>
      </div>
      
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <header style={{ background: 'white', padding: '16px 24px', boxShadow: '0 1px 2px rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center' }}>
          <button onClick={() => setCollapsed(!collapsed)} style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', marginRight: 16 }}>
            {collapsed ? '☰' : '✕'}
          </button>
          <h1 style={{ fontSize: 20, margin: 0 }}>合同管理系统</h1>
          <div style={{ marginLeft: 'auto' }}>
            <span>{new Date().toLocaleDateString()}</span>
          </div>
        </header>
        <div style={{ padding: 24, flex: 1 }}>
          {children}
        </div>
      </div>
    </div>
  );
}