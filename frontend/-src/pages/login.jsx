import React, { useState } from 'react';
import api from '../core/api';

export default function Login({ onLogin }) {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin123');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      
      const result = await response.json();
      
      if (result.code === 0 && result.data) {
        api.setToken(result.data.token);
        if (onLogin) {
          onLogin(result.data.user);
        } else {
          window.location.href = '/';
        }
      } else {
        setError(result.msg || '登录失败');
      }
    } catch (err) {
      setError('网络错误，请检查后端服务');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
      <div style={{ background: 'white', padding: 40, borderRadius: 8, width: 400, boxShadow: '0 10px 40px rgba(0,0,0,0.1)' }}>
        <h2 style={{ textAlign: 'center', marginBottom: 32 }}>合同管理系统</h2>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 20 }}>
            <input
              type="text"
              placeholder="用户名"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              style={{ width: '100%', padding: 12, border: '1px solid #ddd', borderRadius: 4, fontSize: 14 }}
            />
          </div>
          <div style={{ marginBottom: 20 }}>
            <input
              type="password"
              placeholder="密码"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{ width: '100%', padding: 12, border: '1px solid #ddd', borderRadius: 4, fontSize: 14 }}
            />
          </div>
          {error && <div style={{ color: '#e74c3c', marginBottom: 16, textAlign: 'center' }}>{error}</div>}
          <button 
            type="submit" 
            disabled={loading}
            style={{ width: '100%', padding: 12, background: '#3498db', color: 'white', border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: 16 }}
          >
            {loading ? '登录中...' : '登录'}
          </button>
        </form>
        <div style={{ marginTop: 16, fontSize: 12, color: '#999', textAlign: 'center' }}>
          测试账号: admin / admin123
        </div>
      </div>
    </div>
  );
}