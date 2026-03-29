import React from 'react';

export default function Sidebar({ collapsed, currentPath, onNavigate }) {
  const menus = [
    { path: '/', icon: '📊', label: '仪表盘' }
  ];
  
  return (
    <div style={{ width: '100%' }}>
      <div style={{ padding: 20, textAlign: 'center', borderBottom: '1px solid #34495e' }}>
        {collapsed ? 'CMS' : '合同管理系统'}
      </div>
      <div style={{ padding: '20px 0' }}>
        {menus.map(menu => (
          <div
            key={menu.path}
            style={{
              padding: '12px 20px',
              cursor: 'pointer',
              background: currentPath === menu.path ? '#3498db' : 'transparent'
            }}
            onClick={() => onNavigate(menu.path)}
          >
            <span>{menu.icon}</span>
            {!collapsed && <span style={{ marginLeft: 12 }}>{menu.label}</span>}
          </div>
        ))}
      </div>
    </div>
  );
}