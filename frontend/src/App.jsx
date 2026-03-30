import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/login';
import Dashboard from './pages/dash';
import Contracts from './pages/Contracts';
import Customers from './pages/Customers';
import Suppliers from './pages/Suppliers';
import Payments from './pages/Payments';
import SystemManage from './pages/SystemManage';
import MainLayout from './layout/main';
import api from './core/api';
import './style/main.css';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      api.setToken(token);
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setUser({ id: payload.id, username: payload.username, role: payload.role });
      } catch (e) {
        console.error('Invalid token');
      }
    }
    setLoading(false);
  }, []);
  
  if (loading) {
    return <div className="loading">加载中...</div>;
  }
  
  const isLogin = !!api.token;
  
  if (!isLogin) {
    return <Login onLogin={(userData) => {
      setUser(userData);
      window.location.href = '/';
    }} />;
  }
  
  return (
    <BrowserRouter>
      <MainLayout user={user}>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/contracts" element={<Contracts />} />
          <Route path="/customers" element={<Customers />} />
          <Route path="/suppliers" element={<Suppliers />} />
          <Route path="/payments" element={<Payments />} />
          <Route path="/system" element={<SystemManage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </MainLayout>
    </BrowserRouter>
  );
}

export default App;