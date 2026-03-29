import React, { useState, useEffect } from 'react';
import api from '../../core/api';
import eventBus from '../../core/eventBus';

export default function PaymentForm({ visible, paymentId, contractId, onClose, onSuccess }) {
  const [form, setForm] = useState({ contractId: contractId || '', stage: '', amount: '', dueDate: '', type: 'payment', remark: '' });
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  
  useEffect(() => {
    if (visible) {
      loadContracts();
      if (paymentId) loadPayment();
      else if (contractId) setForm({ ...form, contractId });
    }
  }, [visible, paymentId, contractId]);
  
  const loadContracts = async () => {
    try {
      const result = await api.get('/contracts', { size: 1000 });
      setContracts((result.list || []).filter(c => c.status === 2 || c.status === 3));
    } catch (err) { console.error('加载合同失败:', err); }
  };
  
  const loadPayment = async () => {
    setLoading(true);
    try {
      const result = await api.get('/payments', { id: paymentId });
      if (result.list && result.list[0]) {
        const data = result.list[0];
        setForm({
          contractId: data.contract_id, stage: data.stage, amount: data.amount,
          dueDate: data.due_date ? data.due_date.split('T')[0] : '', type: data.type, remark: data.remark || ''
        });
      }
    } catch (err) { alert(err.message); } finally { setLoading(false); }
  };
  
  const validate = () => {
    const newErrors = {};
    if (!form.contractId) newErrors.contractId = '请选择合同';
    if (!form.stage) newErrors.stage = '付款阶段不能为空';
    if (!form.amount || form.amount <= 0) newErrors.amount = '金额必须大于0';
    if (!form.dueDate) newErrors.dueDate = '到期日期不能为空';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      const data = { ...form, amount: parseFloat(form.amount), contractId: parseInt(form.contractId) };
      if (paymentId) await api.put(`/payments/${paymentId}`, data);
      else await api.post('/payments', data);
      alert(paymentId ? '更新成功' : '创建成功');
      eventBus.emit('dataChanged');
      onSuccess();
    } catch (err) { alert(err.message); } finally { setSubmitting(false); }
  };
  
  if (!visible) return null;
  
  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }} onClick={onClose}>
      <div style={{ background: 'white', borderRadius: 8, width: '90%', maxWidth: 500, maxHeight: '90vh', overflow: 'auto' }} onClick={e => e.stopPropagation()}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #e9ecef' }}>
          <h3>{paymentId ? '编辑付款计划' : '新增付款计划'}</h3>
        </div>
        
        {loading ? <div className="loading">加载中...</div> : (
          <form onSubmit={handleSubmit}>
            <div style={{ padding: 20 }}>
              {!contractId && (
                <div style={{ marginBottom: 16 }}>
                  <label>选择合同 *</label>
                  <select value={form.contractId} onChange={e => setForm({ ...form, contractId: e.target.value })} style={{ width: '100%', padding: 8, border: `1px solid ${errors.contractId ? '#e74c3c' : '#ddd'}`, borderRadius: 4 }}>
                    <option value="">请选择合同</option>
                    {contracts.map(c => <option key={c.id} value={c.id}>{c.code} - {c.name} (¥{c.amount.toLocaleString()})</option>)}
                  </select>
                  {errors.contractId && <span style={{ color: '#e74c3c', fontSize: 12 }}>{errors.contractId}</span>}
                </div>
              )}
              
              <div style={{ marginBottom: 16 }}>
                <label>类型 *</label>
                <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })} style={{ width: '100%', padding: 8, border: '1px solid #ddd', borderRadius: 4 }}>
                  <option value="payment">付款</option><option value="receipt">收款</option>
                </select>
              </div>
              
              <div style={{ marginBottom: 16 }}>
                <label>付款阶段 *</label>
                <input type="text" value={form.stage} onChange={e => setForm({ ...form, stage: e.target.value })} placeholder="如：首付款、尾款" style={{ width: '100%', padding: 8, border: `1px solid ${errors.stage ? '#e74c3c' : '#ddd'}`, borderRadius: 4 }} />
                {errors.stage && <span style={{ color: '#e74c3c', fontSize: 12 }}>{errors.stage}</span>}
              </div>
              
              <div style={{ marginBottom: 16 }}>
                <label>金额 *</label>
                <input type="number" step="0.01" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} style={{ width: '100%', padding: 8, border: `1px solid ${errors.amount ? '#e74c3c' : '#ddd'}`, borderRadius: 4 }} />
                {errors.amount && <span style={{ color: '#e74c3c', fontSize: 12 }}>{errors.amount}</span>}
              </div>
              
              <div style={{ marginBottom: 16 }}>
                <label>到期日期 *</label>
                <input type="date" value={form.dueDate} onChange={e => setForm({ ...form, dueDate: e.target.value })} style={{ width: '100%', padding: 8, border: `1px solid ${errors.dueDate ? '#e74c3c' : '#ddd'}`, borderRadius: 4 }} />
                {errors.dueDate && <span style={{ color: '#e74c3c', fontSize: 12 }}>{errors.dueDate}</span>}
              </div>
              
              <div style={{ marginBottom: 16 }}>
                <label>备注</label>
                <textarea rows="3" value={form.remark} onChange={e => setForm({ ...form, remark: e.target.value })} style={{ width: '100%', padding: 8, border: '1px solid #ddd', borderRadius: 4 }} />
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