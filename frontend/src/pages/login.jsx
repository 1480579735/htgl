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
      console.log('登录请求发送:', { username, password });
      
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      console.log('响应状态:', response.status);
      
      const result = await response.json();
      console.log('响应数据:', result);

      if (result.code === 0 && result.data) {
        api.setToken(result.data.token);
        if (onLogin) {
          onLogin(result.data.user);
        } else {
          window.location.href = '/';
        }
      } else {
        setError(result.message || '登录失败');
      }
    } catch (err) {
      console.error('登录错误:', err);
      setError('网络错误，请检查后端服务');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h2>合同管理系统</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <input
              type="text"
              placeholder="用户名"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>
          <div className="form-group">
            <input
              type="password"
              placeholder="密码"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          {error && <div className="error-msg">{error}</div>}
          <button 
            type="submit" 
            className="btn-primary" 
            disabled={loading} 
            style={{ 
              width: '100%', 
              textAlign: 'center',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center'
            }}
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