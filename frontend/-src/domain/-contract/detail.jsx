import React, { useState, useEffect } from 'react';
import store from './store';
import { STATUS_TEXT, TYPE_TEXT } from './enums';
import { formatDate, formatMoney } from '../../shared/utils';

export default function ContractDetail({ visible, contractId, onClose }) {
  const [contract, setContract] = useState(null);
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    if (visible && contractId) {
      loadDetail();
    }
  }, [visible, contractId]);
  
  const loadDetail = async () => {
    setLoading(true);
    try {
      await store.loadDetail(contractId);
      setContract(store.get().cur);
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };
  
  if (!visible) return null;
  
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content modal-large" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>合同详情</h3>
          <button className="close" onClick={onClose}>&times;</button>
        </div>
        
        {loading && <div className="loading">加载中...</div>}
        
        {contract && (
          <div className="contract-detail">
            <div className="detail-section">
              <h4>基本信息</h4>
              <div className="detail-row">
                <span className="label">合同编号：</span>
                <span>{contract.code}</span>
              </div>
              <div className="detail-row">
                <span className="label">合同名称：</span>
                <span>{contract.name}</span>
              </div>
              <div className="detail-row">
                <span className="label">合同类型：</span>
                <span>{TYPE_TEXT[contract.type]}</span>
              </div>
              <div className="detail-row">
                <span className="label">客户名称：</span>
                <span>{contract.custName}</span>
              </div>
              <div className="detail-row">
                <span className="label">合同金额：</span>
                <span>¥{formatMoney(contract.amount)}</span>
              </div>
              <div className="detail-row">
                <span className="label">签订日期：</span>
                <span>{formatDate(contract.signDate)}</span>
              </div>
              <div className="detail-row">
                <span className="label">合同期限：</span>
                <span>{formatDate(contract.startDate)} 至 {formatDate(contract.endDate)}</span>
              </div>
              <div className="detail-row">
                <span className="label">合同状态：</span>
                <span className={`status status-${contract.status}`}>
                  {STATUS_TEXT[contract.status]}
                </span>
              </div>
              <div className="detail-row">
                <span className="label">剩余天数：</span>
                <span>{contract.daysLeft}天</span>
              </div>
            </div>
            
            {contract.content && (
              <div className="detail-section">
                <h4>合同内容</h4>
                <div className="detail-content">{contract.content}</div>
              </div>
            )}
            
            {contract.plans && contract.plans.length > 0 && (
              <div className="detail-section">
                <h4>付款计划</h4>
                <table className="detail-table">
                  <thead>
                    <tr>
                      <th>阶段</th>
                      <th>类型</th>
                      <th>金额</th>
                      <th>到期日</th>
                      <th>状态</th>
                    </tr>
                  </thead>
                  <tbody>
                    {contract.plans.map(p => (
                      <tr key={p.id}>
                        <td>{p.stage}</td>
                        <td>{p.type === 'payment' ? '付款' : '收款'}</td>
                        <td>¥{formatMoney(p.amount)}</td>
                        <td>{formatDate(p.dueDate)}</td>
                        <td>{p.status === 0 ? '待处理' : '已完成'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}