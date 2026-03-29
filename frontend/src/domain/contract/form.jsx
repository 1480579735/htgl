import React, { useState, useEffect } from 'react';
import api from '../../core/api';
import eventBus from '../../core/eventBus';

export default function ContractForm({ visible, contractId, onClose, onSuccess }) {
  const [form, setForm] = useState({
    name: '',
    direction: '1',
    type: 'sales',
    amount: '',
    custId: '',
    supplierId: '',
    signDate: new Date().toISOString().split('T')[0],
    startDate: '',
    endDate: '',
    content: '',
    attachments: []
  });
  const [customers, setCustomers] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [uploading, setUploading] = useState(false);
  
  useEffect(() => {
    if (visible) {
      loadCustomers();
      loadSuppliers();
      if (contractId) loadContract();
    }
  }, [visible, contractId]);
  
  const loadCustomers = async () => {
    try {
      const result = await api.get('/customers', { size: 1000 });
      setCustomers(result.list || []);
    } catch (err) { console.error('加载客户失败:', err); }
  };
  
  const loadSuppliers = async () => {
    try {
      const result = await api.get('/suppliers', { size: 1000 });
      setSuppliers(result.list || []);
    } catch (err) { console.error('加载供应商失败:', err); }
  };
  
  const loadContract = async () => {
    setLoading(true);
    try {
      const data = await api.get(`/contracts/${contractId}`);
      setForm({
        name: data.name || '',
        direction: data.direction?.toString() || '1',
        type: data.type || 'sales',
        amount: data.amount || '',
        custId: data.custId || '',
        supplierId: data.supplierId || '',
        signDate: data.signDate ? data.signDate.split('T')[0] : new Date().toISOString().split('T')[0],
        startDate: data.startDate ? data.startDate.split('T')[0] : '',
        endDate: data.endDate ? data.endDate.split('T')[0] : '',
        content: data.content || '',
        attachments: data.attachments || []
      });
    } catch (err) { alert(err.message); } finally { setLoading(false); }
  };
  
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) { alert('文件大小不能超过10MB'); return; }
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png'];
    if (!allowedTypes.includes(file.type)) { alert('只支持 PDF、JPG、PNG 格式'); return; }
    
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const response = await fetch('/api/upload', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
        body: formData
      });
      const result = await response.json();
      if (result.code === 0) {
        setForm({ ...form, attachments: [...form.attachments, result.data] });
        alert('上传成功');
      } else { alert(result.msg || '上传失败'); }
    } catch (err) { alert('上传失败'); } finally { setUploading(false); e.target.value = ''; }
  };
  
  const removeAttachment = (index) => {
    const newAttachments = [...form.attachments];
    newAttachments.splice(index, 1);
    setForm({ ...form, attachments: newAttachments });
  };
  
  const validate = () => {
    const newErrors = {};
    if (!form.name) newErrors.name = '合同名称不能为空';
    if (!form.amount || form.amount <= 0) newErrors.amount = '金额必须大于0';
    if (form.direction === '1' && !form.custId) newErrors.partner = '请选择客户';
    if (form.direction === '2' && !form.supplierId) newErrors.partner = '请选择供应商';
    if (form.startDate && form.endDate && new Date(form.startDate) >= new Date(form.endDate)) newErrors.date = '开始日期必须早于结束日期';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      const data = {
        name: form.name,
        direction: parseInt(form.direction),
        type: form.type,
        amount: parseFloat(form.amount),
        signDate: form.signDate,
        startDate: form.startDate,
        endDate: form.endDate,
        content: form.content
      };
      if (form.direction === '1') data.custId = parseInt(form.custId);
      else data.supplierId = parseInt(form.supplierId);
      
      if (contractId) await api.put(`/contracts/${contractId}`, data);
      else await api.post('/contracts', data);
      
      alert(contractId ? '更新成功' : '创建成功');
      eventBus.emit('dataChanged');
      onSuccess();
    } catch (err) { alert(err.message); } finally { setSubmitting(false); }
  };
  
  if (!visible) return null;
  
  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }} onClick={onClose}>
      <div style={{ background: 'white', borderRadius: 8, width: '90%', maxWidth: 700, maxHeight: '90vh', overflow: 'auto' }} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', borderBottom: '1px solid #e9ecef' }}>
          <h3>{contractId ? '编辑合同' : '新建合同'}</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 24, cursor: 'pointer' }}>&times;</button>
        </div>
        
        {loading ? <div className="loading">加载中...</div> : (
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, padding: '0 20px', marginBottom: 16 }}>
              <div className="form-group">
                <label>合同名称 *</label>
                <input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} style={{ width: '100%', padding: 8, border: `1px solid ${errors.name ? '#e74c3c' : '#ddd'}`, borderRadius: 4 }} />
                {errors.name && <span style={{ color: '#e74c3c', fontSize: 12 }}>{errors.name}</span>}
              </div>
              <div className="form-group">
                <label>合同方向 *</label>
                <select value={form.direction} onChange={e => setForm({ ...form, direction: e.target.value, custId: '', supplierId: '' })} style={{ width: '100%', padding: 8, border: '1px solid #ddd', borderRadius: 4 }}>
                  <option value="1">销项合同（销售给客户）</option>
                  <option value="2">进项合同（向供应商采购）</option>
                </select>
              </div>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, padding: '0 20px', marginBottom: 16 }}>
              <div className="form-group">
                <label>{form.direction === '1' ? '客户 *' : '供应商 *'}</label>
                {form.direction === '1' ? (
                  <select value={form.custId} onChange={e => setForm({ ...form, custId: e.target.value })} style={{ width: '100%', padding: 8, border: `1px solid ${errors.partner ? '#e74c3c' : '#ddd'}`, borderRadius: 4 }}>
                    <option value="">请选择客户</option>
                    {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                ) : (
                  <select value={form.supplierId} onChange={e => setForm({ ...form, supplierId: e.target.value })} style={{ width: '100%', padding: 8, border: `1px solid ${errors.partner ? '#e74c3c' : '#ddd'}`, borderRadius: 4 }}>
                    <option value="">请选择供应商</option>
                    {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                )}
                {errors.partner && <span style={{ color: '#e74c3c', fontSize: 12 }}>{errors.partner}</span>}
              </div>
              <div className="form-group">
                <label>合同类型 *</label>
                <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })} style={{ width: '100%', padding: 8, border: '1px solid #ddd', borderRadius: 4 }}>
                  <option value="purchase">采购合同</option>
                  <option value="sales">销售合同</option>
                  <option value="service">服务合同</option>
                  <option value="lease">租赁合同</option>
                </select>
              </div>
            </div>
            
            <div style={{ padding: '0 20px', marginBottom: 16 }}>
              <div className="form-group">
                <label>合同金额 *</label>
                <input type="number" step="0.01" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} style={{ width: '100%', padding: 8, border: `1px solid ${errors.amount ? '#e74c3c' : '#ddd'}`, borderRadius: 4 }} />
                {errors.amount && <span style={{ color: '#e74c3c', fontSize: 12 }}>{errors.amount}</span>}
              </div>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, padding: '0 20px', marginBottom: 16 }}>
              <div className="form-group"><label>签订日期</label><input type="date" value={form.signDate} onChange={e => setForm({ ...form, signDate: e.target.value })} style={{ width: '100%', padding: 8, border: '1px solid #ddd', borderRadius: 4 }} /></div>
              <div className="form-group"><label>开始日期</label><input type="date" value={form.startDate} onChange={e => setForm({ ...form, startDate: e.target.value })} style={{ width: '100%', padding: 8, border: '1px solid #ddd', borderRadius: 4 }} /></div>
              <div className="form-group"><label>结束日期</label><input type="date" value={form.endDate} onChange={e => setForm({ ...form, endDate: e.target.value })} style={{ width: '100%', padding: 8, border: '1px solid #ddd', borderRadius: 4 }} /></div>
            </div>
            {errors.date && <div style={{ color: '#e74c3c', fontSize: 12, padding: '0 20px', marginBottom: 16 }}>{errors.date}</div>}
            
            <div style={{ padding: '0 20px', marginBottom: 16 }}>
              <label>合同内容</label>
              <textarea rows="5" value={form.content} onChange={e => setForm({ ...form, content: e.target.value })} style={{ width: '100%', padding: 8, border: '1px solid #ddd', borderRadius: 4 }} />
            </div>
            
            <div style={{ padding: '0 20px', marginBottom: 16 }}>
              <label>合同附件</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                <input type="file" id="file-upload" accept=".pdf,.jpg,.jpeg,.png" onChange={handleFileUpload} disabled={uploading} style={{ display: 'none' }} />
                <button type="button" className="btn-secondary" onClick={() => document.getElementById('file-upload').click()} disabled={uploading}>{uploading ? '上传中...' : '上传附件'}</button>
                <span style={{ fontSize: 12, color: '#999' }}>支持 PDF、JPG、PNG 格式，最大10MB</span>
              </div>
              {form.attachments.length > 0 && (
                <div style={{ marginTop: 12, padding: 12, background: '#f8f9fa', borderRadius: 4 }}>
                  <label>已上传附件：</label>
                  {form.attachments.map((file, idx) => (
                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 8, background: 'white', borderRadius: 4, marginTop: 4 }}>
                      <span>{file.originalName}</span>
                      <button type="button" onClick={() => removeAttachment(idx)} style={{ background: '#e74c3c', color: 'white', border: 'none', padding: '2px 8px', borderRadius: 3, cursor: 'pointer' }}>删除</button>
                    </div>
                  ))}
                </div>
              )}
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