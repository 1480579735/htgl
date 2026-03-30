import React, { useState, useEffect } from 'react';
import api from '../core/api';
import { formatMoney, formatDate } from '../shared/utils';

export default function Payments() {
  const [loading, setLoading] = useState(true);
  const [payments, setPayments] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, size: 20, total: 0, pages: 0 });
  const [filters, setFilters] = useState({ type: '', status: '' });
  const [showModal, setShowModal] = useState(false);
  const [showPayModal, setShowPayModal] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [contracts, setContracts] = useState([]);
  const [form, setForm] = useState({ contractId: '', stage: '', amount: '', dueDate: '', type: 'payment', remark: '' });
  const [payForm, setPayForm] = useState({ actualDate: new Date().toISOString().split('T')[0], invoiceNo: '', remark: '' });

  useEffect(() => {
    loadPayments();
    loadContracts();
  }, [pagination.page, filters]);

  const loadPayments = async () => {
    setLoading(true);
    try {
      const params = { page: pagination.page, limit: pagination.size, ...filters };
      const res = await api.get('/payments', params);
      setPayments(res.list || []);
      setPagination({
        page: res.page,
        size: res.limit,
        total: res.total,
        pages: res.pages
      });
    } catch (err) {
      console.error('加载付款计划失败:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadContracts = async () => {
    try {
      const res = await api.get('/contracts');
      setContracts((res.list || []).filter(c => c.status === 2 || c.status === 3));
    } catch (err) {
      console.error('加载合同失败:', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/payments', { ...form, amount: parseFloat(form.amount), contractId: parseInt(form.contractId) });
      alert('创建成功');
      setShowModal(false);
      resetForm();
      loadPayments();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleRecordPay = async () => {
    try {
      await api.post(`/payments/${selectedPayment.id}/pay`, payForm);
      alert('记录成功');
      setShowPayModal(false);
      loadPayments();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('确定删除该付款计划吗？')) {
      try {
        await api.delete(`/payments/${id}`);
        alert('删除成功');
        loadPayments();
      } catch (err) {
        alert(err.message);
      }
    }
  };

  const resetForm = () => {
    setForm({ contractId: '', stage: '', amount: '', dueDate: '', type: 'payment', remark: '' });
  };

  const getTypeText = (type) => type === 'payment' ? '付款' : '收款';
  const getStatusText = (status, dueDate) => {
    if (status === 1) return '已完成';
    if (new Date(dueDate) < new Date()) return '逾期';
    return '待处理';
  };
  const getStatusClass = (status, dueDate) => {
    if (status === 1) return 'status-completed';
    if (new Date(dueDate) < new Date()) return 'status-terminated';
    return 'status-pending';
  };

  // 表头样式
  const headerStyle = {
    display: 'grid',
    gridTemplateColumns: '0.8fr 1.2fr 1fr 0.6fr 1fr 0.8fr 0.8fr 0.8fr 1fr',
    background: '#f8fafc',
    padding: '12px 16px',
    fontWeight: 'bold',
    borderBottom: '1px solid #e2e8f0'
  };

  const rowStyle = {
    display: 'grid',
    gridTemplateColumns: '0.8fr 1.2fr 1fr 0.6fr 1fr 0.8fr 0.8fr 0.8fr 1fr',
    padding: '12px 16px',
    borderBottom: '1px solid #f1f5f9',
    alignItems: 'center'
  };

  if (loading && payments.length === 0) {
    return <div className="loading">加载中...</div>;
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24 }}>
        <h2>收付款管理</h2>
        <button className="btn-primary" onClick={() => setShowModal(true)}>+ 新增计划</button>
      </div>

      <div className="filters">
        <select value={filters.type} onChange={(e) => setFilters({ ...filters, type: e.target.value, page: 1 })}>
          <option value="">全部类型</option>
          <option value="payment">付款</option>
          <option value="receipt">收款</option>
        </select>
        <select value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value, page: 1 })}>
          <option value="">全部状态</option>
          <option value="0">待处理</option>
          <option value="1">已完成</option>
        </select>
      </div>

      <div style={{ overflowX: 'auto', background: 'white', borderRadius: 8 }}>
        <div style={headerStyle}>
          <div>合同编号</div>
          <div>合同名称</div>
          <div>客户</div>
          <div>类型</div>
          <div>阶段</div>
          <div>金额</div>
          <div>到期日</div>
          <div>状态</div>
          <div>操作</div>
        </div>
        
        {payments.map(payment => (
          <div key={payment.id} style={rowStyle}>
            <div>{payment.contract_code || '-'}</div>
            <div>{payment.contract_name || '-'}</div>
            <div>{payment.customer_name || '-'}</div>
            <div>{getTypeText(payment.type)}</div>
            <div>{payment.stage}</div>
            <div>¥{formatMoney(payment.amount)}</div>
            <div className={new Date(payment.due_date) < new Date() && payment.status === 0 ? 'overdue' : ''}>
              {formatDate(payment.due_date)}
            </div>
            <div>
              <span className={`status-badge ${getStatusClass(payment.status, payment.due_date)}`}>
                {getStatusText(payment.status, payment.due_date)}
              </span>
            </div>
            <div>
              <div className="button-group">
                {payment.status === 0 && (
                  <>
                    <button className="btn-sm" onClick={() => { setSelectedPayment(payment); setPayForm({ actualDate: new Date().toISOString().split('T')[0], invoiceNo: '', remark: '' }); setShowPayModal(true); }}>记录</button>
                    <button className="btn-sm btn-danger" onClick={() => handleDelete(payment.id)}>删除</button>
                  </>
                )}
              </div>
            </div>
          </div>
        ))}
        
        {payments.length === 0 && !loading && (
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

      {/* 新增付款计划弹窗 */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>新增付款计划</h3>
              <button className="close" onClick={() => setShowModal(false)}>&times;</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>选择合同 *</label>
                <select value={form.contractId} onChange={e => setForm({...form, contractId: e.target.value})} required>
                  <option value="">请选择合同</option>
                  {contracts.map(c => <option key={c.id} value={c.id}>{c.code} - {c.title}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>类型 *</label>
                <select value={form.type} onChange={e => setForm({...form, type: e.target.value})}>
                  <option value="payment">付款</option>
                  <option value="receipt">收款</option>
                </select>
              </div>
              <div className="form-group">
                <label>付款阶段 *</label>
                <input type="text" value={form.stage} onChange={e => setForm({...form, stage: e.target.value})} required placeholder="如：首付款、尾款" />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>金额 *</label>
                  <input type="number" step="0.01" value={form.amount} onChange={e => setForm({...form, amount: e.target.value})} required />
                </div>
                <div className="form-group">
                  <label>到期日期 *</label>
                  <input type="date" value={form.dueDate} onChange={e => setForm({...form, dueDate: e.target.value})} required />
                </div>
              </div>
              <div className="form-group">
                <label>备注</label>
                <textarea rows="2" value={form.remark} onChange={e => setForm({...form, remark: e.target.value})} />
              </div>
              <div className="form-actions">
                <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>取消</button>
                <button type="submit" className="btn-primary">保存</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 记录付款弹窗 */}
      {showPayModal && selectedPayment && (
        <div className="modal-overlay" onClick={() => setShowPayModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>记录{selectedPayment.type === 'payment' ? '付款' : '收款'}</h3>
              <button className="close" onClick={() => setShowPayModal(false)}>&times;</button>
            </div>
            <div style={{ padding: '0 20px' }}>
              <div className="form-group">
                <label>合同: {selectedPayment.contract_name}</label>
              </div>
              <div className="form-group">
                <label>阶段: {selectedPayment.stage}</label>
              </div>
              <div className="form-group">
                <label>金额: ¥{formatMoney(selectedPayment.amount)}</label>
              </div>
              <div className="form-group">
                <label>实际日期 *</label>
                <input type="date" value={payForm.actualDate} onChange={e => setPayForm({...payForm, actualDate: e.target.value})} required />
              </div>
              <div className="form-group">
                <label>发票号</label>
                <input type="text" value={payForm.invoiceNo} onChange={e => setPayForm({...payForm, invoiceNo: e.target.value})} />
              </div>
              <div className="form-group">
                <label>备注</label>
                <textarea rows="2" value={payForm.remark} onChange={e => setPayForm({...payForm, remark: e.target.value})} />
              </div>
            </div>
            <div className="form-actions">
              <button className="btn-secondary" onClick={() => setShowPayModal(false)}>取消</button>
              <button className="btn-primary" onClick={handleRecordPay}>确认</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}