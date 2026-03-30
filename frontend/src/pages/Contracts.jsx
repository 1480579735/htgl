import React, { useState, useEffect } from 'react';
import api from '../core/api';
import { formatMoney } from '../shared/utils';

export default function Contracts() {
  const [loading, setLoading] = useState(true);
  const [contracts, setContracts] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, size: 20, total: 0, pages: 0 });
  const [filters, setFilters] = useState({ status: '', type: '', keyword: '' });
  const [showModal, setShowModal] = useState(false);
  const [editingContract, setEditingContract] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState({
    code: '', title: '', type: 'sales', direction: 1,
    amount: '', partyId: '', partyName: '', effectiveDate: '', expiryDate: '', terms: '',
    attachments: []
  });
  const [parties, setParties] = useState([]);

  useEffect(() => {
    loadContracts();
    loadParties();
  }, [pagination.page, filters]);

  const loadContracts = async () => {
    setLoading(true);
    try {
      const params = { page: pagination.page, limit: pagination.size, ...filters };
      const res = await api.get('/contracts', params);
      setContracts(res.list || []);
      setPagination({
        page: res.page,
        size: res.limit,
        total: res.total,
        pages: res.pages
      });
    } catch (err) {
      console.error('加载合同失败:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadParties = async () => {
    try {
      const res = await api.get('/parties');
      setParties(res.list || []);
    } catch (err) {
      console.error('加载客户失败:', err);
    }
  };

  // 文件上传处理
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // 检查文件大小 (限制10MB)
    if (file.size > 10 * 1024 * 1024) {
      alert('文件大小不能超过10MB');
      return;
    }
    
    // 检查文件类型
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
    if (!allowedTypes.includes(file.type)) {
      alert('只支持 PDF、JPG、PNG 格式的文件');
      return;
    }
    
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      // 如果有合同编号，添加到文件名中
      if (form.code) {
        formData.append('contractCode', form.code);
      }
      
      const response = await fetch('/api/upload/contract', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
      });
      
      const result = await response.json();
      if (result.code === 0) {
        setForm({
          ...form,
          attachments: [...form.attachments, result.data]
        });
        alert('上传成功');
      } else {
        alert(result.message || '上传失败');
      }
    } catch (err) {
      console.error('上传失败:', err);
      alert('上传失败');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };
  
  // 删除附件
  const removeAttachment = (index) => {
    const newAttachments = [...form.attachments];
    newAttachments.splice(index, 1);
    setForm({ ...form, attachments: newAttachments });
  };
  
  // 下载附件
  const downloadAttachment = (attachment) => {
    window.open(attachment.filePath, '_blank');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const submitData = {
        ...form,
        amount: parseFloat(form.amount),
        partyId: parseInt(form.partyId),
        attachments: form.attachments
      };
      
      if (editingContract) {
        await api.put(`/contracts/${editingContract.id}`, submitData);
        alert('更新成功');
      } else {
        await api.post('/contracts', submitData);
        alert('创建成功');
      }
      setShowModal(false);
      setEditingContract(null);
      resetForm();
      loadContracts();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleSubmitApproval = async (id) => {
    if (window.confirm('确定提交审批吗？')) {
      try {
        await api.post(`/contracts/${id}/submit`);
        alert('提交成功');
        loadContracts();
      } catch (err) {
        alert(err.message);
      }
    }
  };

  const handleApprove = async (id, result) => {
    const txt = result === 'pass' ? '通过' : '驳回';
    const remark = window.prompt(`请输入${txt}意见：`);
    if (remark !== null) {
      try {
        await api.post(`/contracts/${id}/approve`, { result, remark });
        alert('操作成功');
        loadContracts();
      } catch (err) {
        alert(err.message);
      }
    }
  };

  const handleStart = async (id) => {
    if (window.confirm('确定开始执行该合同吗？')) {
      try {
        await api.post(`/contracts/${id}/start`);
        alert('已开始执行');
        loadContracts();
      } catch (err) {
        alert(err.message);
      }
    }
  };

  const handleComplete = async (id) => {
    if (window.confirm('确定完成该合同吗？')) {
      try {
        await api.post(`/contracts/${id}/complete`);
        alert('已完成');
        loadContracts();
      } catch (err) {
        alert(err.message);
      }
    }
  };

  const handleTerminate = async (id) => {
    const reason = window.prompt('请输入终止原因：');
    if (reason) {
      try {
        await api.post(`/contracts/${id}/terminate`, { reason });
        alert('已终止');
        loadContracts();
      } catch (err) {
        alert(err.message);
      }
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('确定删除该合同吗？')) {
      try {
        await api.delete(`/contracts/${id}`);
        alert('删除成功');
        loadContracts();
      } catch (err) {
        alert(err.message);
      }
    }
  };

  const resetForm = () => {
    setForm({
      code: '', title: '', type: 'sales', direction: 1,
      amount: '', partyId: '', partyName: '', effectiveDate: '', expiryDate: '', terms: '',
      attachments: []
    });
  };

  const getStatusText = (status) => {
    const map = { 0: '草稿', 1: '待批', 2: '生效', 3: '执行', 4: '完成', 5: '终止' };
    return map[status] || '未知';
  };

  const getTypeText = (type) => {
    const map = { purchase: '采购', sales: '销售', service: '服务', lease: '租赁' };
    return map[type] || type;
  };

  const getDirectionText = (direction) => {
    return direction === 1 ? '销项' : '进项';
  };

  // 表头样式
  const headerStyle = {
    display: 'grid',
    gridTemplateColumns: '0.8fr 1.2fr 0.6fr 1fr 0.6fr 0.8fr 0.8fr 1.2fr',
    background: '#f8fafc',
    padding: '12px 16px',
    fontWeight: 'bold',
    borderBottom: '1px solid #e2e8f0'
  };

  const rowStyle = {
    display: 'grid',
    gridTemplateColumns: '0.8fr 1.2fr 0.6fr 1fr 0.6fr 0.8fr 0.8fr 1.2fr',
    padding: '12px 16px',
    borderBottom: '1px solid #f1f5f9',
    alignItems: 'center'
  };

  if (loading && contracts.length === 0) {
    return <div className="loading">加载中...</div>;
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24 }}>
        <h2>合同管理</h2>
        <button className="btn-primary" onClick={() => { resetForm(); setEditingContract(null); setShowModal(true); }}>
          + 新建合同
        </button>
      </div>

      <div className="filters">
        <input
          type="text"
          placeholder="搜索合同编号/名称"
          value={filters.keyword}
          onChange={(e) => setFilters({ ...filters, keyword: e.target.value, page: 1 })}
          style={{ width: 250 }}
        />
        <select value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value, page: 1 })}>
          <option value="">全部状态</option>
          <option value="0">草稿</option>
          <option value="1">待批</option>
          <option value="2">生效</option>
          <option value="3">执行</option>
          <option value="4">完成</option>
          <option value="5">终止</option>
        </select>
        <select value={filters.type} onChange={(e) => setFilters({ ...filters, type: e.target.value, page: 1 })}>
          <option value="">全部类型</option>
          <option value="purchase">采购</option>
          <option value="sales">销售</option>
          <option value="service">服务</option>
          <option value="lease">租赁</option>
        </select>
      </div>

      <div style={{ overflowX: 'auto', background: 'white', borderRadius: 8 }}>
        <div style={headerStyle}>
          <div>编号</div>
          <div>名称</div>
          <div>方向</div>
          <div>合作方</div>
          <div>类型</div>
          <div>金额</div>
          <div>状态</div>
          <div>操作</div>
        </div>
        
        {contracts.map(contract => (
          <div key={contract.id} style={rowStyle}>
            <div>{contract.code}</div>
            <div>{contract.title}</div>
            <div>{getDirectionText(contract.direction)}</div>
            <div>{contract.party_name}</div>
            <div>{getTypeText(contract.type)}</div>
            <div>¥{formatMoney(contract.amount)}</div>
            <div>
              <span className={`status-badge status-${contract.status}`}>
                {getStatusText(contract.status)}
              </span>
            </div>
            <div>
              <div className="button-group">
                <button className="btn-sm" onClick={() => { 
                  setEditingContract(contract); 
                  setForm({
                    code: contract.code, title: contract.title, type: contract.type, direction: contract.direction,
                    amount: contract.amount, partyId: contract.party_id, partyName: contract.party_name,
                    effectiveDate: contract.effective_date?.split('T')[0] || '',
                    expiryDate: contract.expiry_date?.split('T')[0] || '', terms: contract.terms || '',
                    attachments: contract.attachments || []
                  }); 
                  setShowModal(true); 
                }}>编辑</button>
                {contract.status === 0 && (
                  <>
                    <button className="btn-sm btn-success" onClick={() => handleSubmitApproval(contract.id)}>提交</button>
                    <button className="btn-sm btn-danger" onClick={() => handleDelete(contract.id)}>删除</button>
                  </>
                )}
                {contract.status === 1 && (
                  <>
                    <button className="btn-sm btn-success" onClick={() => handleApprove(contract.id, 'pass')}>通过</button>
                    <button className="btn-sm btn-danger" onClick={() => handleApprove(contract.id, 'reject')}>驳回</button>
                  </>
                )}
                {contract.status === 2 && (
                  <button className="btn-sm" onClick={() => handleStart(contract.id)}>开始执行</button>
                )}
                {contract.status === 3 && (
                  <>
                    <button className="btn-sm" onClick={() => handleComplete(contract.id)}>完成</button>
                    <button className="btn-sm btn-danger" onClick={() => handleTerminate(contract.id)}>终止</button>
                  </>
                )}
              </div>
            </div>
          </div>
        ))}
        
        {contracts.length === 0 && !loading && (
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

      {/* 合同表单弹窗 - 添加附件上传区域 */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content modal-large" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editingContract ? '编辑合同' : '新建合同'}</h3>
              <button className="close" onClick={() => setShowModal(false)}>&times;</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label>合同编号</label>
                  <input type="text" value={form.code} onChange={e => setForm({...form, code: e.target.value})} required />
                </div>
                <div className="form-group">
                  <label>合同名称</label>
                  <input type="text" value={form.title} onChange={e => setForm({...form, title: e.target.value})} required />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>合同类型</label>
                  <select value={form.type} onChange={e => setForm({...form, type: e.target.value})}>
                    <option value="purchase">采购</option>
                    <option value="sales">销售</option>
                    <option value="service">服务</option>
                    <option value="lease">租赁</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>合同方向</label>
                  <select value={form.direction} onChange={e => setForm({...form, direction: parseInt(e.target.value)})}>
                    <option value="1">销项合同</option>
                    <option value="2">进项合同</option>
                  </select>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>合作方</label>
                  <select value={form.partyId} onChange={e => {
                    const party = parties.find(p => p.id == e.target.value);
                    setForm({...form, partyId: e.target.value, partyName: party?.name || ''});
                  }} required>
                    <option value="">请选择</option>
                    {parties.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>合同金额</label>
                  <input type="number" step="0.01" value={form.amount} onChange={e => setForm({...form, amount: e.target.value})} required />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>生效日期</label>
                  <input type="date" value={form.effectiveDate} onChange={e => setForm({...form, effectiveDate: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>失效日期</label>
                  <input type="date" value={form.expiryDate} onChange={e => setForm({...form, expiryDate: e.target.value})} />
                </div>
              </div>
              <div className="form-group">
                <label>合同条款</label>
                <textarea rows="4" value={form.terms} onChange={e => setForm({...form, terms: e.target.value})} />
              </div>
              
              {/* 附件上传区域 */}
              <div className="form-group">
                <label>合同附件</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                  <input
                    type="file"
                    id="file-upload"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={handleFileUpload}
                    disabled={uploading}
                    style={{ display: 'none' }}
                  />
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={() => document.getElementById('file-upload').click()}
                    disabled={uploading}
                  >
                    {uploading ? '上传中...' : '选择文件'}
                  </button>
                  <span style={{ fontSize: 12, color: '#999' }}>
                    支持 PDF、JPG、PNG 格式，最大10MB
                  </span>
                </div>
                
                {form.attachments.length > 0 && (
                  <div style={{ marginTop: 12, border: '1px solid #e2e8f0', borderRadius: 8, overflow: 'hidden' }}>
                    <div style={{ background: '#f8fafc', padding: '8px 12px', fontWeight: 500, borderBottom: '1px solid #e2e8f0' }}>
                      已上传附件 ({form.attachments.length})
                    </div>
                    {form.attachments.map((file, index) => (
                      <div key={index} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', borderBottom: '1px solid #f1f5f9' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span>📄</span>
                          <span style={{ fontSize: 13 }}>{file.originalName}</span>
                          <span style={{ fontSize: 11, color: '#999' }}>{(file.fileSize / 1024).toFixed(1)} KB</span>
                        </div>
                        <div style={{ display: 'flex', gap: 8 }}>
                          <button
                            type="button"
                            className="btn-sm"
                            style={{ background: '#3498db', padding: '2px 8px' }}
                            onClick={() => downloadAttachment(file)}
                          >
                            下载
                          </button>
                          <button
                            type="button"
                            className="btn-sm btn-danger"
                            style={{ padding: '2px 8px' }}
                            onClick={() => removeAttachment(index)}
                          >
                            删除
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
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