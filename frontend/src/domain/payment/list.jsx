import React, { useState, useEffect } from 'react';
import api from '../../core/api';
import eventBus from '../../core/eventBus';
import { formatMoney, formatDate } from '../../shared/utils';

export default function PaymentList({ onAdd }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [list, setList] = useState([]);
  const [page, setPage] = useState({ cur: 1, size: 20, total: 0, pages: 0 });
  const [filter, setFilter] = useState({ type: '', status: '' });
  const [showPayModal, setShowPayModal] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);
  
  useEffect(() => {
    loadPayments();
  }, [page.cur, filter]);
  
  const loadPayments = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = { page: page.cur, size: page.size, ...filter };
      if (!params.type) delete params.type;
      if (params.status === '') delete params.status;
      
      const result = await api.get('/payments', params);
      setList(result.list || []);
      setPage({
        cur: result.page,
        size: result.size,
        total: result.total,
        pages: result.pages
      });
    } catch (err) {
      console.error('加载付款计划失败:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  
  const onTypeChange = (type) => {
    setFilter({ ...filter, type });
    setPage({ ...page, cur: 1 });
  };
  
  const onStatusChange = (status) => {
    setFilter({ ...filter, status });
    setPage({ ...page, cur: 1 });
  };
  
  const onPageChange = (newPage) => {
    setPage({ ...page, cur: newPage });
  };
  
  const onRecordPay = async (paymentId, data) => {
    try {
      await api.post(`/payments/${paymentId}/pay`, data);
      alert('记录成功');
      setShowPayModal(false);
      loadPayments();
      eventBus.emit('dataChanged');
    } catch (err) {
      alert(err.message);
    }
  };
  
  const onDelete = async (id) => {
    if (window.confirm('确定删除该付款计划吗？')) {
      try {
        await api.delete(`/payments/${id}`);
        alert('删除成功');
        loadPayments();
        eventBus.emit('dataChanged');
      } catch (err) {
        alert(err.message);
      }
    }
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
  
  if (loading && list.length === 0) return <div className="loading">加载中...</div>;
  if (error) return <div className="error">错误: {error}</div>;
  
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h2>收付款管理</h2>
        <button className="btn-primary" onClick={() => onAdd && onAdd()}>新增计划</button>
      </div>
      
      <div className="filters">
        <select value={filter.type} onChange={(e) => onTypeChange(e.target.value)}>
          <option value="">全部类型</option>
          <option value="payment">付款</option>
          <option value="receipt">收款</option>
        </select>
        <select value={filter.status} onChange={(e) => onStatusChange(e.target.value)}>
          <option value="">全部状态</option>
          <option value="0">待处理</option>
          <option value="1">已完成</option>
        </select>
      </div>
      
      <div style={{ overflowX: 'auto', background: 'white', borderRadius: 8 }}>
        <table className="data-table">
          <thead>
            <tr>
              <th>合同编号</th>
              <th>合同名称</th>
              <th>客户</th>
              <th>类型</th>
              <th>阶段</th>
              <th>金额</th>
              <th>到期日</th>
              <th>状态</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            {list.map(item => (
              <tr key={item.id}>
                <td>{item.contract_code || '-'}</td>
                <td>{item.contract_name || '-'}</td>
                <td>{item.customer_name || '-'}</td>
                <td>{getTypeText(item.type)}</td>
                <td>{item.stage}</td>
                <td>¥{formatMoney(item.amount)}</td>
                <td className={new Date(item.due_date) < new Date() && item.status === 0 ? 'overdue' : ''}>
                  {formatDate(item.due_date)}
                </td>
                <td>
                  <span className={`status-badge ${getStatusClass(item.status, item.due_date)}`}>
                    {getStatusText(item.status, item.due_date)}
                  </span>
                </td>
                <td>
                  <div className="button-group">
                    {item.status === 0 && (
                      <>
                        <button className="btn-sm" onClick={() => { setSelectedPayment(item); setShowPayModal(true); }}>记录</button>
                        <button className="btn-sm btn-danger" onClick={() => onDelete(item.id)}>删除</button>
                      </>
                    )}
                    {item.status === 1 && (
                      <button className="btn-sm btn-info" onClick={() => alert('查看发票功能开发中')}>发票</button>
                    )}
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
      
      {showPayModal && (
        <PayModal 
          payment={selectedPayment} 
          onClose={() => setShowPayModal(false)} 
          onConfirm={(data) => onRecordPay(selectedPayment.id, data)} 
        />
      )}
    </div>
  );
}

function PayModal({ payment, onClose, onConfirm }) {
  const [form, setForm] = useState({ 
    actualDate: new Date().toISOString().split('T')[0], 
    invoiceNo: '', 
    remark: '' 
  });
  
  if (!payment) return null;
  
  const handleSubmit = (e) => {
    e.preventDefault();
    onConfirm(form);
  };
  
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>记录{payment.type === 'payment' ? '付款' : '收款'}</h3>
          <button className="close" onClick={onClose}>&times;</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>合同: {payment.contract_name}</label>
          </div>
          <div className="form-group">
            <label>阶段: {payment.stage}</label>
          </div>
          <div className="form-group">
            <label>金额: ¥{formatMoney(payment.amount)}</label>
          </div>
          <div className="form-group">
            <label>实际日期 *</label>
            <input 
              type="date" 
              value={form.actualDate} 
              onChange={e => setForm({ ...form, actualDate: e.target.value })} 
              required 
            />
          </div>
          <div className="form-group">
            <label>发票号</label>
            <input 
              type="text" 
              value={form.invoiceNo} 
              onChange={e => setForm({ ...form, invoiceNo: e.target.value })} 
            />
          </div>
          <div className="form-group">
            <label>备注</label>
            <textarea 
              rows="3" 
              value={form.remark} 
              onChange={e => setForm({ ...form, remark: e.target.value })} 
            />
          </div>
          <div className="form-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>取消</button>
            <button type="submit" className="btn-primary">确认</button>
          </div>
        </form>
      </div>
    </div>
  );
}