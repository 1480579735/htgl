import React, { useState, useEffect } from 'react';
import api from '../core/api';

export default function Suppliers() {
  const [loading, setLoading] = useState(true);
  const [suppliers, setSuppliers] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, size: 20, total: 0, pages: 0 });
  const [filters, setFilters] = useState({ keyword: '', type: 'supplier' });
  const [showModal, setShowModal] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState(null);
  const [form, setForm] = useState({
    code: '', name: '', type: 'supplier', contact: '', phone: '', email: '', address: '', rating: 3
  });

  useEffect(() => {
    loadSuppliers();
  }, [pagination.page, filters]);

  const loadSuppliers = async () => {
    setLoading(true);
    try {
      const params = { page: pagination.page, limit: pagination.size, ...filters };
      const res = await api.get('/parties', params);
      setSuppliers(res.list || []);
      setPagination({
        page: res.page,
        size: res.limit,
        total: res.total,
        pages: res.pages
      });
    } catch (err) {
      console.error('加载供应商失败:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingSupplier) {
        await api.put(`/parties/${editingSupplier.id}`, form);
        alert('更新成功');
      } else {
        await api.post('/parties', form);
        alert('创建成功');
      }
      setShowModal(false);
      setEditingSupplier(null);
      resetForm();
      loadSuppliers();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('确定删除该供应商吗？')) {
      try {
        await api.delete(`/parties/${id}`);
        alert('删除成功');
        loadSuppliers();
      } catch (err) {
        alert(err.message);
      }
    }
  };

  const resetForm = () => {
    setForm({
      code: '', name: '', type: 'supplier', contact: '', phone: '', email: '', address: '', rating: 3
    });
  };

  const getRatingStars = (rating) => {
    return [...Array(5)].map((_, i) => (
      <span key={i} style={{ color: i < rating ? '#f39c12' : '#ddd', fontSize: 16 }}>★</span>
    ));
  };

  // 表头样式
  const headerStyle = {
    display: 'grid',
    gridTemplateColumns: '1fr 1.5fr 1fr 1fr 1.5fr 0.8fr 1.2fr',
    background: '#f8fafc',
    padding: '12px 16px',
    fontWeight: 'bold',
    borderBottom: '1px solid #e2e8f0'
  };

  const rowStyle = {
    display: 'grid',
    gridTemplateColumns: '1fr 1.5fr 1fr 1fr 1.5fr 0.8fr 1.2fr',
    padding: '12px 16px',
    borderBottom: '1px solid #f1f5f9',
    alignItems: 'center'
  };

  if (loading && suppliers.length === 0) {
    return <div className="loading">加载中...</div>;
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24 }}>
        <h2>供应商管理</h2>
        <button className="btn-primary" onClick={() => { resetForm(); setEditingSupplier(null); setShowModal(true); }}>
          + 新增供应商
        </button>
      </div>

      <div className="filters">
        <input
          type="text"
          placeholder="搜索供应商名称/编码/联系人"
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
          <div>等级</div>
          <div>操作</div>
        </div>
        
        {suppliers.map(supplier => (
          <div key={supplier.id} style={rowStyle}>
            <div>{supplier.code}</div>
            <div>{supplier.name}</div>
            <div>{supplier.contact || '-'}</div>
            <div>{supplier.phone || '-'}</div>
            <div>{supplier.email || '-'}</div>
            <div>{getRatingStars(supplier.rating)}</div>
            <div>
              <div className="button-group">
                <button className="btn-sm" onClick={() => { setEditingSupplier(supplier); setForm(supplier); setShowModal(true); }}>编辑</button>
                <button className="btn-sm btn-danger" onClick={() => handleDelete(supplier.id)}>删除</button>
              </div>
            </div>
          </div>
        ))}
        
        {suppliers.length === 0 && !loading && (
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

      {/* 供应商表单弹窗 */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editingSupplier ? '编辑供应商' : '新增供应商'}</h3>
              <button className="close" onClick={() => setShowModal(false)}>&times;</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>供应商编码 *</label>
                <input type="text" value={form.code} onChange={e => setForm({...form, code: e.target.value})} required />
              </div>
              <div className="form-group">
                <label>供应商名称 *</label>
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
                <label>供应商等级</label>
                <select value={form.rating} onChange={e => setForm({...form, rating: parseInt(e.target.value)})}>
                  <option value="5">★★★★★ (5星 - 战略合作)</option>
                  <option value="4">★★★★☆ (4星 - 优质)</option>
                  <option value="3">★★★☆☆ (3星 - 合格)</option>
                  <option value="2">★★☆☆☆ (2星 - 待改进)</option>
                  <option value="1">★☆☆☆☆ (1星 - 淘汰)</option>
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