import React, { useState, useEffect, useCallback } from 'react';
import api from '../core/api';
import eventBus from '../core/eventBus';
import { formatMoney } from '../shared/utils';
import './dash.css';

export default function Dashboard() {
  const [contractStats, setContractStats] = useState(null);
  const [supplierStats, setSupplierStats] = useState(null);
  const [expiring, setExpiring] = useState([]);
  const [topSuppliers, setTopSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [error, setError] = useState(null);
  
  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [statsData, expiringData, supplierStatsData, topSuppliersData] = await Promise.all([
        api.get('/contracts/stats/dashboard'),
        api.get('/contracts/expiring/list', { days: 30 }),
        api.get('/suppliers/stats/dashboard'),
        api.get('/suppliers/top/list', { limit: 5 })
      ]);
      
      setContractStats(statsData);
      setExpiring(expiringData || []);
      setSupplierStats(supplierStatsData);
      setTopSuppliers(topSuppliersData || []);
      setLastUpdate(new Date());
    } catch (err) {
      console.error('加载数据失败:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);
  
  useEffect(() => {
    loadData();
  }, [loadData]);
  
  useEffect(() => {
    const unsubscribe = eventBus.on('dataChanged', () => {
      loadData();
    });
    return unsubscribe;
  }, [loadData]);
  
  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(() => {
      loadData();
    }, 30000);
    return () => clearInterval(interval);
  }, [autoRefresh, loadData]);
  
  const handleRefresh = () => loadData();
  const toggleAutoRefresh = () => setAutoRefresh(!autoRefresh);
  
  const formatTime = (date) => {
    return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}:${date.getSeconds().toString().padStart(2, '0')}`;
  };
  
  const getStatusText = (status) => {
    const map = { 0: '草稿', 1: '待批', 2: '生效', 3: '执行', 4: '完成', 5: '终止' };
    return map[status] || '未知';
  };
  
  const getDaysLeft = (endDate) => {
    const end = new Date(endDate);
    const now = new Date();
    const diff = end - now;
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };
  
  if (error) {
    return (
      <div className="error-container">
        <div className="error-message">加载失败: {error}</div>
        <button className="btn-primary" onClick={loadData}>重试</button>
      </div>
    );
  }
  
  if (loading && !contractStats) {
    return <div className="loading">加载中...</div>;
  }
  
  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h2>仪表盘</h2>
        <div className="dashboard-actions">
          <span className="update-time">最后更新: {formatTime(lastUpdate)}</span>
          <button className="btn-sm" onClick={handleRefresh} disabled={loading}>
            {loading ? '刷新中...' : '🔄 刷新'}
          </button>
          <button 
            className={`btn-sm ${autoRefresh ? 'btn-success' : 'btn-secondary'}`}
            onClick={toggleAutoRefresh}
          >
            {autoRefresh ? '⏸ 自动刷新中' : '▶ 自动刷新关闭'}
          </button>
        </div>
      </div>
      
      <h3>合同统计</h3>
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-value">{contractStats?.total || 0}</div>
          <div className="stat-label">合同总数</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{contractStats?.executingCount || 0}</div>
          <div className="stat-label">执行中</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{contractStats?.pending || 0}</div>
          <div className="stat-label">待审批</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{expiring.length}</div>
          <div className="stat-label">即将到期</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">¥{formatMoney(contractStats?.activeAmount || 0)}</div>
          <div className="stat-label">执行中金额</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">¥{formatMoney(contractStats?.avgAmount || 0)}</div>
          <div className="stat-label">平均金额</div>
        </div>
      </div>
      
      {supplierStats && (
        <>
          <h3>供应商统计</h3>
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-value">{supplierStats.total || 0}</div>
              <div className="stat-label">供应商总数</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{supplierStats.active || 0}</div>
              <div className="stat-label">启用中</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{supplierStats.highRating || 0}</div>
              <div className="stat-label">优质供应商(≥4星)</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{supplierStats.avgRating ? supplierStats.avgRating.toFixed(1) : 0}</div>
              <div className="stat-label">平均等级</div>
            </div>
          </div>
        </>
      )}
      
      <div className="info-section">
        <h3>即将到期合同</h3>
        {expiring.length === 0 ? (
          <p>暂无即将到期的合同</p>
        ) : (
          <table className="simple-table">
            <thead>
              <tr>
                <th>合同编号</th>
                <th>合同名称</th>
                <th>客户/供应商</th>
                <th>到期日</th>
                <th>剩余天数</th>
                <th>状态</th>
              </tr>
            </thead>
            <tbody>
              {expiring.slice(0, 10).map(item => (
                <tr key={item.id}>
                  <td>{item.code}</td>
                  <td>{item.name}</td>
                  <td>{item.cust_name || item.supplier_name || '-'}</td>
                  <td>{new Date(item.end_date).toLocaleDateString()}</td>
                  <td className={getDaysLeft(item.end_date) <= 7 ? 'urgent' : ''}>
                    {getDaysLeft(item.end_date)}天
                  </td>
                  <td>{getStatusText(item.status)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      
      {topSuppliers.length > 0 && (
        <div className="info-section">
          <h3>优质供应商 TOP5</h3>
          <table className="simple-table">
            <thead>
              <tr>
                <th>编码</th>
                <th>名称</th>
                <th>联系人</th>
                <th>电话</th>
                <th>等级</th>
              </tr>
            </thead>
            <tbody>
              {topSuppliers.map(item => (
                <tr key={item.id}>
                  <td>{item.code}</td>
                  <td>{item.name}</td>
                  <td>{item.contact || '-'}</td>
                  <td>{item.phone || '-'}</td>
                  <td>
                    {[...Array(5)].map((_, i) => (
                      <span key={i} style={{ color: i < item.rating ? '#f39c12' : '#ddd' }}>★</span>
                    ))}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}