import React from 'react';

export default function Header({ user, onCollapse, collapsed }) {
  const now = new Date();
  const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  
  return (
    <header className="header">
      <button className="collapse-btn" onClick={onCollapse}>
        {collapsed ? '☰' : '✕'}
      </button>
      <h1 className="page-title">合同管理系统</h1>
      <div className="header-right">
        <span className="date">{dateStr}</span>
        <span className="user-name">{user?.realName || user?.name || '用户'}</span>
      </div>
    </header>
  );
}