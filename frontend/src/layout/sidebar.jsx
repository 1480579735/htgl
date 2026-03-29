import React from 'react';
import './sidebar.css';

const menus = [
  { path: '/', icon: '📊', label: '仪表盘' },
  { path: '/contracts', icon: '📄', label: '合同管理' },
  { path: '/customers', icon: '👥', label: '客户管理' },
  { path: '/suppliers', icon: '🏭', label: '供应商管理' },
  { path: '/payments', icon: '💰', label: '收付款' }
];

export default function Sidebar({ collapsed, currentPath, onNavigate }) {
  return (
    <aside className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
      <nav className="sidebar-nav">
        {menus.map(menu => (
          <a
            key={menu.path}
            href="#"
            className={`nav-item ${currentPath === menu.path ? 'active' : ''}`}
            onClick={(e) => {
              e.preventDefault();
              onNavigate(menu.path);
            }}
          >
            <span className="nav-icon">{menu.icon}</span>
            {!collapsed && <span className="nav-label">{menu.label}</span>}
          </a>
        ))}
      </nav>
    </aside>
  );
}