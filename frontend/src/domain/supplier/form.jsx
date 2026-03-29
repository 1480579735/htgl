import React, { useState, useEffect } from 'react';
import store from './store';
import eventBus from '../../core/eventBus';

export default function SupplierForm({ visible, supplierId, onClose, onSuccess }) {
  const [form, setForm] = useState({
    code: '', name: '', contact: '', phone: '', email: '', address: '',
    bankName: '', bankAccount: '', taxNo: '', rating: 3
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  useEffect(() => {
    if (visible && supplierId) loadSupplier();
    else if (visible) resetForm();
  }, [visible, supplierId]);
  
  const loadSupplier = async () => {
    setLoading(true);
    try {
      await store.loadDetail(supplierId);
      const data = store.get().cur;
      if (data) setForm({
        code: data.code || '', name: data.name || '', contact: data.contact || '',
        phone: data.phone || '', email: data.email || '', address: data.address || '',
        bankName: data.bankName || '', bankAccount: data.bankAccount || '', taxNo: data.taxNo || '',
        rating: data.rating || 3
      });
    } catch (err) { alert(err.message); } finally { setLoading(false); }
  };
  
  const resetForm = () => {
    setForm({ code: '', name: '', contact: '', phone: '', email: '', address: '', bankName: '', bankAccount: '', taxNo: '', rating: 3 });
    setErrors({});
  };
  
  const handleChange = (field, value) => {
    setForm({ ...form, [field]: value });
    if (errors[field]) setErrors({ ...errors, [field]: null });
  };
  
  const validate = () => {
    const newErrors = {};
    if (!form.code) newErrors.code = '供应商编码不能为空';
    else if (form.code.length > 50) newErrors.code = '编码不能超过50个字符';
    if (!form.name) newErrors.name = '供应商名称不能为空';
    else if (form.name.length > 100) newErrors.name = '名称不能超过100个字符';
    if (form.phone && !/^1[3-9]\d{9}$/.test(form.phone)) newErrors.phone = '手机号格式不正确';
    if (form.email && !/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(form.email)) newErrors.email = '邮箱格式不正确';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      if (supplierId) await store.update(supplierId, form);
      else await store.create(form);
      alert(supplierId ? '更新成功' : '创建成功');
      eventBus.emit('dataChanged');
      onSuccess();
    } catch (err) { alert(err.message); } finally { setSubmitting(false); }
  };
  
  if (!visible) return null;
  
  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }} onClick={onClose}>
      <div style={{ background: 'white', borderRadius: 8, width: '90%', maxWidth: 600, maxHeight: '90vh', overflow: 'auto' }} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', borderBottom: '1px solid #e9ecef' }}>
          <h3>{supplierId ? '编辑供应商' : '新增供应商'}</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 24, cursor: 'pointer' }}>&times;</button>
        </div>
        
        {loading ? <div className="loading">加载中...</div> : (
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, padding: '0 20px', marginBottom: 16 }}>
              <div><label>供应商编码 *</label><input type="text" value={form.code} onChange={e => handleChange('code', e.target.value)} disabled={!!supplierId} style={{ width: '100%', padding: 8, border: `1px solid ${errors.code ? '#e74c3c' : '#ddd'}`, borderRadius: 4 }} />
                {errors.code && <span style={{ color: '#e74c3c', fontSize: 12 }}>{errors.code}</span>}</div>
              <div><label>供应商名称 *</label><input type="text" value={form.name} onChange={e => handleChange('name', e.target.value)} style={{ width: '100%', padding: 8, border: `1px solid ${errors.name ? '#e74c3c' : '#ddd'}`, borderRadius: 4 }} />
                {errors.name && <span style={{ color: '#e74c3c', fontSize: 12 }}>{errors.name}</span>}</div>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, padding: '0 20px', marginBottom: 16 }}>
              <div><label>联系人</label><input type="text" value={form.contact} onChange={e => handleChange('contact', e.target.value)} style={{ width: '100%', padding: 8, border: '1px solid #ddd', borderRadius: 4 }} /></div>
              <div><label>联系电话</label><input type="tel" value={form.phone} onChange={e => handleChange('phone', e.target.value)} style={{ width: '100%', padding: 8, border: `1px solid ${errors.phone ? '#e74c3c' : '#ddd'}`, borderRadius: 4 }} />
                {errors.phone && <span style={{ color: '#e74c3c', fontSize: 12 }}>{errors.phone}</span>}</div>
            </div>
            
            <div style={{ padding: '0 20px', marginBottom: 16 }}>
              <label>联系邮箱</label>
              <input type="email" value={form.email} onChange={e => handleChange('email', e.target.value)} style={{ width: '100%', padding: 8, border: `1px solid ${errors.email ? '#e74c3c' : '#ddd'}`, borderRadius: 4 }} />
              {errors.email && <span style={{ color: '#e74c3c', fontSize: 12 }}>{errors.email}</span>}
            </div>
            
            <div style={{ padding: '0 20px', marginBottom: 16 }}>
              <label>地址</label>
              <textarea rows="2" value={form.address} onChange={e => handleChange('address', e.target.value)} style={{ width: '100%', padding: 8, border: '1px solid #ddd', borderRadius: 4 }} />
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, padding: '0 20px', marginBottom: 16 }}>
              <div><label>开户银行</label><input type="text" value={form.bankName} onChange={e => handleChange('bankName', e.target.value)} style={{ width: '100%', padding: 8, border: '1px solid #ddd', borderRadius: 4 }} /></div>
              <div><label>银行账号</label><input type="text" value={form.bankAccount} onChange={e => handleChange('bankAccount', e.target.value)} style={{ width: '100%', padding: 8, border: '1px solid #ddd', borderRadius: 4 }} /></div>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, padding: '0 20px', marginBottom: 16 }}>
              <div><label>税务登记号</label><input type="text" value={form.taxNo} onChange={e => handleChange('taxNo', e.target.value)} style={{ width: '100%', padding: 8, border: '1px solid #ddd', borderRadius: 4 }} /></div>
              <div><label>供应商等级</label>
                <select value={form.rating} onChange={e => handleChange('rating', parseInt(e.target.value))} style={{ width: '100%', padding: 8, border: '1px solid #ddd', borderRadius: 4 }}>
                  <option value="5">★★★★★ (5星 - 战略合作)</option><option value="4">★★★★☆ (4星 - 优质)</option>
                  <option value="3">★★★☆☆ (3星 - 合格)</option><option value="2">★★☆☆☆ (2星 - 待改进)</option>
                  <option value="1">★☆☆☆☆ (1星 - 淘汰)</option>
                </select>
              </div>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, padding: '16px 20px', borderTop: '1px solid #e9ecef' }}>
              <button type="button" className="btn-secondary" onClick={onClose}>取消</button>
              <button type="submit" className="btn-primary" disabled={submitting}>{submitting ? '保存中...' : '保存'}</button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}