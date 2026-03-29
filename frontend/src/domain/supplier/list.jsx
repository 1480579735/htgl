import React, { useState, useEffect } from 'react';
import api from '../../core/api';
import eventBus from '../../core/eventBus';

export default function SupplierList({ onEdit }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [list, setList] = useState([]);
  const [page, setPage] = useState({ cur: 1, size: 20, total: 0, pages: 0 });
  const [filter, setFilter] = useState({ rating: '', status: '', kw: '' });
  const [stats, setStats] = useState(null);
  
  useEffect(() => {
    loadSuppliers();
    loadStats();
  }, [page.cur, filter]);
  
  const loadSuppliers = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {
        page: page.cur,
        size: page.size,
        ...filter
      };
      if (!params.rating) delete params.rating;
      if (params.status === '') delete params.status;
      if (!params.kw) delete params.kw;
      
      const result = await api.get('/suppliers', params);
      setList(result.list || []);
      setPage({
        cur: result.page,
        size: result.size,
        total: result.total,
        pages: result.pages
      });
    } catch (err) {
      console.error('加载供应商失败:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  
  const loadStats = async () => {
    try {
      const result = await api.get('/suppliers/stats/dashboard');
      setStats(result);
    } catch (err) {
      console.error('加载统计失败:', err);
    }
  };
  
  const onSearch = (kw) => {
    setFilter({ ...filter, kw });
    setPage({ ...page, cur: 1 });
  };
  
  const onRatingChange = (rating) => {
    setFilter({ ...filter, rating: rating || null });
    setPage({ ...page, cur: 1 });
  };
  
  const onStatusChange = (status) => {
    setFilter({ ...filter, status: status !== '' ? parseInt(status) : null });
    setPage({ ...page, cur: 1 });
  };
  
  const onPageChange = (newPage) => {
    setPage({ ...page, cur: newPage });
  };
  
  const onUpdateStatus = async (id, status) => {
    const action = status === 1 ? '启用' : '停用';
    if (window.confirm(`确定${action}该供应商吗？`)) {
      try {
        await api.patch(`/suppliers/${id}/status`, { status });
        alert(`${action}成功`);
        loadSuppliers();
        loadStats();
        eventBus.emit('dataChanged');
      } catch (err) {
        alert(err.message);
      }
    }
  };
  
  const onUpdateRating = async (id, rating) => {
    const ratingText = { 1: '一星', 2: '二星', 3: '三星', 4: '四星', 5: '五星' };
    if (window.confirm(`确定将供应商等级改为${ratingText[rating]}吗？`)) {
      try {
        await api.patch(`/suppliers/${id}/rating`, { rating });
        alert('等级更新成功');
        loadSuppliers();
        loadStats();
        eventBus.emit('dataChanged');
      } catch (err) {
        alert(err.message);
      }
    }
  };
  
  const onDelete = async (id) => {
    if (window.confirm('确定删除该供应商吗？')) {
      try {
        await api.delete(`/suppliers/${id}`);
        alert('删除成功');
        loadSuppliers();
        loadStats();
        eventBus.emit('dataChanged');
      } catch (err) {
        alert(err.message);
      }
    }
  };
  
  const getRatingStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <span key={i} style={{ color: i <= rating ? '#f39c12' : '#ddd', fontSize: 16 }}>★</span>
      );
    }
    return stars;
  };
  
  const getStatusBadge = (status) => {
    return status === 1 
      ? <span className="status-badge status-completed">启用</span> 
      : <span className="status-badge status-terminated">停用</span>;
  };
  
  if (loading && list.length === 0) return <div className="loading">加载中...</div>;
  if (error) return <div className="error">错误: {error}</div>;
  
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h2>供应商管理</h2>
        <button className="btn-primary" onClick={() => onEdit && onEdit(null)}>新增供应商</button>
      </div>
      
      {stats && (
        <div className="stats-grid" style={{ marginBottom: 24 }}>
          <div className="stat-card">
            <div className="stat-value">{stats.total || 0}</div>
            <div className="stat-label">供应商总数</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{stats.active || 0}</div>
            <div className="stat-label">启用中</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{stats.highRating || 0}</div>
            <div className="stat-label">优质供应商(≥4星)</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{stats.avgRating ? stats.avgRating.toFixed(1) : 0}</div>
            <div className="stat-label">平均等级</div>
          </div>
        </div>
      )}
      
      <div className="filters">
        <input
          type="text"
          placeholder="搜索供应商名称/编码/联系人"
          value={filter.kw}
          onChange={(e) => onSearch(e.target.value)}
        />
        <select value={filter.rating || ''} onChange={(e) => onRatingChange(e.target.value)}>
          <option value="">全部等级</option>
          <option value="5">★★★★★ (5星)</option>
          <option value="4">★★★★☆ (4星)</option>
          <option value="3">★★★☆☆ (3星)</option>
          <option value="2">★★☆☆☆ (2星)</option>
          <option value="1">★☆☆☆☆ (1星)</option>
        </select>
        <select value={filter.status !== undefined && filter.status !== null ? filter.status : ''} onChange={(e) => onStatusChange(e.target.value)}>
          <option value="">全部状态</option>
          <option value="1">启用</option>
          <option value="0">停用</option>
        </select>
      </div>
      
      <div style={{ overflowX: 'auto', background: 'white', borderRadius: 8 }}>
        <table className="data-table">
          <thead>
            <tr>
              <th>编码</th>
              <th>名称</th>
              <th>联系人</th>
              <th>电话</th>
              <th>等级</th>
              <th>状态</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            {list.map(item => (
              <tr key={item.id}>
                <td>{item.code}</td>
                <td>{item.name}</td>
                <td>{item.contact || '-'}</td>
                <td>{item.phone || '-'}</td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    {getRatingStars(item.rating)}
                    <select 
                      value={item.rating} 
                      onChange={(e) => onUpdateRating(item.id, parseInt(e.target.value))} 
                      style={{ width: 70, padding: 2, fontSize: 12, height: 28 }}
                    >
                      <option value="1">1星</option>
                      <option value="2">2星</option>
                      <option value="3">3星</option>
                      <option value="4">4星</option>
                      <option value="5">5星</option>
                    </select>
                  </div>
                </td>
                <td>{getStatusBadge(item.status)}</td>
                <td>
                  <div className="button-group">
                    <button className="btn-sm" onClick={() => onEdit && onEdit(item.id)}>编辑</button>
                    <button className="btn-sm" onClick={() => onUpdateStatus(item.id, item.status === 1 ? 0 : 1)}>
                      {item.status === 1 ? '停用' : '启用'}
                    </button>
                    <button className="btn-sm btn-danger" onClick={() => onDelete(item.id)}>删除</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {list.length === 0 && !loading && (
        <div className="empty">暂无数据</div>
      )}
      
      {page.pages > 1 && (
        <div className="pagination">
          <button disabled={page.cur === 1} onClick={() => onPageChange(page.cur - 1)}>
            上一页
          </button>
          <span>第 {page.cur} / {page.pages} 页</span>
          <button disabled={page.cur === page.pages} onClick={() => onPageChange(page.cur + 1)}>
            下一页
          </button>
        </div>
      )}
    </div>
  );
}