import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../core/api';
import ChangePasswordModal from '../components/ChangePasswordModal';
import './main.css';

export default function MainLayout({ children, user }) {
  const [collapsed, setCollapsed] = useState(false);
  const [showChangePwd, setShowChangePwd] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const currentPath = location.pathname;

  const logout = () => {
    if (window.confirm('确定要退出登录吗？')) {
      api.setToken(null);
      navigate('/login');
    }
  };

  // 所有菜单项
  const menus = [
    { path: '/', icon: '📊', label: '仪表盘' },
    { path: '/contracts', icon: '📄', label: '合同管理' },
    { path: '/customers', icon: '👥', label: '客户管理' },
    { path: '/suppliers', icon: '🏭', label: '供应商管理' },
    { path: '/payments', icon: '💰', label: '收付款' }
  ];
  
  // 只有管理员能看到系统管理菜单
  if (user?.role === 'admin') {
    menus.push({ path: '/system', icon: '⚙️', label: '系统管理' });
  }

  return (
    <div className="app-layout">
      {/* 侧边栏 - 无 Logo */}
      <aside className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
        <nav className="sidebar-nav">
          {menus.map(menu => (
            <a
              key={menu.path}
              href="#"
              className={`nav-item ${currentPath === menu.path ? 'active' : ''}`}
              onClick={(e) => {
                e.preventDefault();
                navigate(menu.path);
              }}
            >
              <span className="nav-icon">{menu.icon}</span>
              {!collapsed && <span className="nav-label">{menu.label}</span>}
            </a>
          ))}
        </nav>
      </aside>
      
      <div className={`main-container ${collapsed ? 'collapsed' : ''}`}>
        {/* 通栏头部 */}
        <header className="app-header">
          <div className="header-left">
            <button className="collapse-btn" onClick={() => setCollapsed(!collapsed)}>☰</button>
            <div className="system-title">合同管理系统</div>
          </div>
          <div className="header-right">
            <div className="user-info">
              <span className="user-icon">👤</span>
              <span className="user-name">{user?.realName || user?.username || '用户'}</span>
              <span className="user-role">{user?.role === 'admin' ? '管理员' : '普通用户'}</span>
            </div>
            <button className="btn-sm" onClick={() => setShowChangePwd(true)}>🔒 修改密码</button>
            <button className="logout-btn" onClick={logout}>🚪 退出</button>
          </div>
        </header>
        <main className="app-content">
          {children}
        </main>
      </div>
      
      <ChangePasswordModal
        visible={showChangePwd}
        onClose={() => setShowChangePwd(false)}
        onSuccess={() => {
          setShowChangePwd(false);
          logout();
        }}
      />
    </div>
  );
}