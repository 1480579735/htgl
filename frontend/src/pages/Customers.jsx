import React, { useState, useEffect } from 'react';
import api from '../core/api';

export default function Customers() {
  const [loading, setLoading] = useState(true);
  const [customers, setCustomers] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, size: 20, total: 0, pages: 0 });
  const [filters, setFilters] = useState({ keyword: '', type: 'customer' });
  const [showModal, setShowModal] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [form, setForm] = useState({
    code: '', name: '', type: 'customer', contact: '', phone: '', email: '', address: '', riskLevel: 0
  });

  useEffect(() => {
    loadCustomers();
  }, [pagination.page, filters]);

  const loadCustomers = async () => {
    setLoading(true);
    try {
      const params = { page: pagination.page, limit: pagination.size, ...filters };
      const res = await api.get('/parties', params);
      setCustomers(res.list || []);
      setPagination({
        page: res.page,
        size: res.limit,
        total: res.total,
        pages: res.pages
      });
    } catch (err) {
      console.error('加载客户失败:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingCustomer) {
        await api.put(`/parties/${editingCustomer.id}`, form);
        alert('更新成功');
      } else {
        await api.post('/parties', form);
        alert('创建成功');
      }
      setShowModal(false);
      setEditingCustomer(null);
      resetForm();
      loadCustomers();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('确定删除该客户吗？')) {
      try {
        await api.delete(`/parties/${id}`);
        alert('删除成功');
        loadCustomers();
      } catch (err) {
        alert(err.message);
      }
    }
  };

  const resetForm = () => {
    setForm({
      code: '', name: '', type: 'customer', contact: '', phone: '', email: '', address: '', riskLevel: 0
    });
  };

  const getRiskText = (risk) => {
    const map = { 0: '正常', 1: '关注', 2: '高风险' };
    return map[risk] || '正常';
  };

  const getRiskColor = (risk) => {
    const map = { 0: '#27ae60', 1: '#f39c12', 2: '#e74c3c' };
    return map[risk] || '#27ae60';
  };

  // 表头样式
  const headerStyle = {
    display: 'grid',
    gridTemplateColumns: '0.8fr 1.2fr 1fr 1fr 1.2fr 0.8fr 1fr',
    background: '#f8fafc',
    padding: '12px 16px',
    fontWeight: 'bold',
    borderBottom: '1px solid #e2e8f0'
  };

  const rowStyle = {
    display: 'grid',
    gridTemplateColumns: '0.8fr 1.2fr 1fr 1fr 1.2fr 0.8fr 1fr',
    padding: '12px 16px',
    borderBottom: '1px solid #f1f5f9',
    alignItems: 'center'
  };

  if (loading && customers.length === 0) {
    return <div className="loading">加载中...</div>;
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24 }}>
        <h2>客户管理</h2>
        <button className="btn-primary" onClick={() => { resetForm(); setEditingCustomer(null); setShowModal(true); }}>
          + 新增客户
        </button>
      </div>

      <div className="filters">
        <input
          type="text"
          placeholder="搜索客户名称/编码/联系人"
          value={filters.keyword}
          onChange={(e) => setFilters({ ...filters, keyword: e.target.value, page: 1 })}
          style={{ width: 250 }}
        />
      </div>

      <div style={{ overflowX: 'auto', background: 'white', borderRadius: 8 }}>
        <div style={headerStyle}>
          <div>编码</div>
          <div>名称</div>
          <div>联系人</div>
          <div>电话</div>
          <div>邮箱</div>
          <div>风险等级</div>
          <div>操作</div>
        </div>
        
        {customers.map(customer => (
          <div key={customer.id} style={rowStyle}>
            <div>{customer.code}</div>
            <div>{customer.name}</div>
            <div>{customer.contact || '-'}</div>
            <div>{customer.phone || '-'}</div>
            <div>{customer.email || '-'}</div>
            <div>
              <span style={{ color: getRiskColor(customer.risk_level), fontWeight: 500 }}>
                {getRiskText(customer.risk_level)}
              </span>
            </div>
            <div>
              <div className="button-group">
                <button className="btn-sm" onClick={() => { setEditingCustomer(customer); setForm(customer); setShowModal(true); }}>编辑</button>
                <button className="btn-sm btn-danger" onClick={() => handleDelete(customer.id)}>删除</button>
              </div>
            </div>
          </div>
        ))}
        
        {customers.length === 0 && !loading && (
          <div style={{ textAlign: 'center', padding: 40, color: '#666' }}>暂无数据</div>
        )}
      </div>

      {pagination.pages > 1 && (
        <div className="pagination">
          <button disabled={pagination.page === 1} onClick={() => setPagination({ ...pagination, page: pagination.page - 1 })}>上一页</button>
          <span>第 {pagination.page} / {pagination.pages} 页</span>
          <button disabled={pagination.page === pagination.pages} onClick={() => setPagination({ ...pagination, page: pagination.page + 1 })}>下一页</button>
        </div>
      )}

      {/* 客户表单弹窗 */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editingCustomer ? '编辑客户' : '新增客户'}</h3>
              <button className="close" onClick={() => setShowModal(false)}>&times;</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>客户编码 *</label>
                <input type="text" value={form.code} onChange={e => setForm({...form, code: e.target.value})} required />
              </div>
              <div className="form-group">
                <label>客户名称 *</label>
                <input type="text" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>联系人</label>
                  <input type="text" value={form.contact} onChange={e => setForm({...form, contact: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>联系电话</label>
                  <input type="tel" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} />
                </div>
              </div>
              <div className="form-group">
                <label>邮箱</label>
                <input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} />
              </div>
              <div className="form-group">
                <label>地址</label>
                <textarea rows="2" value={form.address} onChange={e => setForm({...form, address: e.target.value})} />
              </div>
              <div className="form-group">
                <label>风险等级</label>
                <select value={form.riskLevel} onChange={e => setForm({...form, riskLevel: parseInt(e.target.value)})}>
                  <option value="0">正常</option>
                  <option value="1">关注</option>
                  <option value="2">高风险</option>
                </select>
              </div>
              <div className="form-actions">
                <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>取消</button>
                <button type="submit" className="btn-primary">保存</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}