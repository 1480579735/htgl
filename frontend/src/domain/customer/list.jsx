import React, { useState, useEffect } from 'react';
import api from '../../core/api';
import eventBus from '../../core/eventBus';

export default function CustomerList({ onEdit }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [list, setList] = useState([]);
  const [page, setPage] = useState({ cur: 1, size: 20, total: 0, pages: 0 });
  const [filter, setFilter] = useState({ risk: '', kw: '' });
  
  useEffect(() => {
    loadCustomers();
  }, [page.cur, filter]);
  
  const loadCustomers = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {
        page: page.cur,
        size: page.size,
        ...filter
      };
      if (!params.risk) delete params.risk;
      if (!params.kw) delete params.kw;
      
      const result = await api.get('/customers', params);
      setList(result.list || []);
      setPage({
        cur: result.page,
        size: result.size,
        total: result.total,
        pages: result.pages
      });
    } catch (err) {
      console.error('加载客户失败:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  
  const onSearch = (kw) => {
    setFilter({ ...filter, kw });
    setPage({ ...page, cur: 1 });
  };
  
  const onRiskChange = (risk) => {
    setFilter({ ...filter, risk });
    setPage({ ...page, cur: 1 });
  };
  
  const onPageChange = (newPage) => {
    setPage({ ...page, cur: newPage });
  };
  
  const onDelete = async (id) => {
    if (window.confirm('确定删除该客户吗？')) {
      try {
        await api.delete(`/customers/${id}`);
        alert('删除成功');
        loadCustomers();
        eventBus.emit('dataChanged');
      } catch (err) {
        alert(err.message);
      }
    }
  };
  
  const onUpdateRisk = async (id, risk) => {
    try {
      await api.patch(`/customers/${id}/risk`, { risk });
      alert('更新成功');
      loadCustomers();
      eventBus.emit('dataChanged');
    } catch (err) {
      alert(err.message);
    }
  };
  
  const getRiskText = (risk) => {
    const map = { 0: '正常', 1: '关注', 2: '高风险' };
    return map[risk] || '正常';
  };
  
  const getRiskColor = (risk) => {
    const map = { 0: '#27ae60', 1: '#f39c12', 2: '#e74c3c' };
    return map[risk] || '#27ae60';
  };
  
  if (loading && list.length === 0) {
    return <div className="loading">加载中...</div>;
  }
  
  if (error) {
    return <div className="error">错误: {error}</div>;
  }
  
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h2>客户管理</h2>
        <button className="btn-primary" onClick={() => onEdit && onEdit(null)}>新增客户</button>
      </div>
      
      <div className="filters">
        <input
          type="text"
          placeholder="搜索客户名称/编码/联系人"
          value={filter.kw}
          onChange={(e) => onSearch(e.target.value)}
        />
        <select value={filter.risk} onChange={(e) => onRiskChange(e.target.value)}>
          <option value="">全部风险</option>
          <option value="0">正常</option>
          <option value="1">关注</option>
          <option value="2">高风险</option>
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
              <th>风险</th>
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
                  <span className="status-badge" style={{ 
                    color: getRiskColor(item.risk), 
                    background: `${getRiskColor(item.risk)}15`, 
                    border: `1px solid ${getRiskColor(item.risk)}` 
                  }}>
                    {getRiskText(item.risk)}
                  </span>
                </td>
                <td>
                  <div className="button-group">
                    <button className="btn-sm" onClick={() => onEdit && onEdit(item.id)}>编辑</button>
                    <button className="btn-sm" onClick={() => onUpdateRisk(item.id, item.risk === 0 ? 1 : 0)}>
                      {item.risk === 0 ? '设为关注' : '设为正常'}
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