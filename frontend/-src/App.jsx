import React, { useState, useEffect } from 'react';
import api from './core/api';
import Login from './pages/login';
import Dashboard from './pages/dash';
import './style/main.css';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentPath, setCurrentPath] = useState(window.location.pathname);
  
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      api.setToken(token);
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setUser({ id: payload.id, name: payload.name, role: payload.role });
      } catch (e) {
        console.error('Invalid token');
      }
    }
    setLoading(false);
    
    const handlePopState = () => {
      setCurrentPath(window.location.pathname);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);
  
  const navigate = (path) => {
    window.history.pushState({}, '', path);
    setCurrentPath(path);
  };
  
  const handleLogin = (userData) => {
    setUser(userData);
    navigate('/');
  };
  
  const handleLogout = () => {
    if (window.confirm('确定要退出登录吗？')) {
      api.setToken(null);
      window.location.href = '/login';
    }
  };
  
  const isLogin = !!api.token;
  
  if (loading) {
    return <div style={{ textAlign: 'center', padding: 50 }}>加载中...</div>;
  }
  
  if (!isLogin && currentPath !== '/login') {
    return <Login onLogin={handleLogin} />;
  }
  
  if (currentPath === '/login') {
    return <Login onLogin={handleLogin} />;
  }
  
  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* 侧边栏 */}
      <div style={{ 
        width: 260, 
        background: '#2c3e50', 
        color: 'white', 
        display: 'flex', 
        flexDirection: 'column',
        position: 'fixed',
        height: '100vh',
        overflow: 'auto'
      }}>
        <div style={{ textAlign: 'center', fontSize: 18, fontWeight: 'bold', padding: '20px', borderBottom: '1px solid #34495e' }}>
          合同管理系统
        </div>
        
        <nav style={{ flex: 1, padding: '20px 0' }}>
          <div 
            style={{ 
              padding: '12px 20px', 
              background: currentPath === '/' ? '#3498db' : 'transparent',
              cursor: 'pointer',
              transition: 'background 0.2s'
            }} 
            onClick={() => navigate('/')}
          >
            📊 仪表盘
          </div>
          <div 
            style={{ padding: '12px 20px', cursor: 'pointer', transition: 'background 0.2s' }} 
            onClick={() => alert('合同管理功能开发中')}
          >
            📄 合同管理
          </div>
          <div 
            style={{ padding: '12px 20px', cursor: 'pointer', transition: 'background 0.2s' }} 
            onClick={() => alert('客户管理功能开发中')}
          >
            👥 客户管理
          </div>
          <div 
            style={{ padding: '12px 20px', cursor: 'pointer', transition: 'background 0.2s' }} 
            onClick={() => alert('供应商管理功能开发中')}
          >
            🏭 供应商管理
          </div>
          <div 
            style={{ padding: '12px 20px', cursor: 'pointer', transition: 'background 0.2s' }} 
            onClick={() => alert('收付款管理功能开发中')}
          >
            💰 收付款
          </div>
        </nav>
        
        {/* 底部用户信息和退出按钮 */}
        <div style={{ 
          padding: '20px', 
          borderTop: '1px solid #34495e',
          marginTop: 'auto'
        }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            marginBottom: '15px',
            padding: '8px 0'
          }}>
            <span style={{ fontSize: 20, marginRight: 10 }}>👤</span>
            <span>{user?.realName || user?.name || '用户'}</span>
          </div>
          <button 
            onClick={handleLogout}
            style={{ 
              width: '100%', 
              padding: '10px', 
              background: '#e74c3c', 
              border: 'none', 
              color: 'white', 
              borderRadius: '4px', 
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: 'bold',
              transition: 'background 0.2s',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
            onMouseEnter={(e) => e.target.style.background = '#c0392b'}
            onMouseLeave={(e) => e.target.style.background = '#e74c3c'}
          >
            <span>🚪</span>
            <span>退出登录</span>
          </button>
        </div>
      </div>
      
      {/* 主内容区域 - 添加左边距避免被侧边栏遮挡 */}
      <div style={{ 
        flex: 1, 
        marginLeft: 260,
        background: '#f5f5f5',
        minHeight: '100vh'
      }}>
        <header style={{ 
          background: 'white', 
          padding: '16px 24px', 
          boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
          borderBottom: '1px solid #e9ecef'
        }}>
          <h1 style={{ margin: 0, fontSize: 20, fontWeight: 500 }}>仪表盘</h1>
        </header>
        <main style={{ padding: 24 }}>
          <Dashboard />
        </main>
      </div>
    </div>
  );
}

export default App;