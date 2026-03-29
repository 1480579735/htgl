import React, { useState, useEffect } from 'react';
import api from '../../core/api';
import { formatDate, formatMoney } from '../../shared/utils';

export default function ContractDetail({ visible, contractId, onClose }) {
  const [contract, setContract] = useState(null);
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    if (visible && contractId) loadDetail();
  }, [visible, contractId]);
  
  const loadDetail = async () => {
    setLoading(true);
    try {
      const data = await api.get(`/contracts/${contractId}`);
      setContract(data);
    } catch (err) { alert(err.message); } finally { setLoading(false); }
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
    return direction === 1 ? '销项合同' : '进项合同';
  };
  
  if (!visible) return null;
  
  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }} onClick={onClose}>
      <div style={{ background: 'white', borderRadius: 8, width: '90%', maxWidth: 700, maxHeight: '90vh', overflow: 'auto' }} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', borderBottom: '1px solid #e9ecef' }}>
          <h3>合同详情</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 24, cursor: 'pointer' }}>&times;</button>
        </div>
        
        {loading ? <div className="loading">加载中...</div> : contract && (
          <div>
            <div style={{ padding: 20 }}>
              <h4>基本信息</h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 8, marginBottom: 20 }}>
                <div><strong>合同编号：</strong></div><div>{contract.code}</div>
                <div><strong>合同名称：</strong></div><div>{contract.name}</div>
                <div><strong>合同方向：</strong></div><div>{getDirectionText(contract.direction)}</div>
                <div><strong>合作方：</strong></div><div>{contract.partnerName || contract.custName || contract.supplierName || '-'}</div>
                <div><strong>合同类型：</strong></div><div>{getTypeText(contract.type)}</div>
                <div><strong>合同金额：</strong></div><div>¥{formatMoney(contract.amount)}</div>
                <div><strong>签订日期：</strong></div><div>{formatDate(contract.signDate)}</div>
                <div><strong>合同期限：</strong></div><div>{formatDate(contract.startDate)} 至 {formatDate(contract.endDate)}</div>
                <div><strong>合同状态：</strong></div><div><span className={`status-badge status-${contract.status}`}>{getStatusText(contract.status)}</span></div>
                <div><strong>剩余天数：</strong></div><div>{contract.daysLeft}天</div>
              </div>
              
              {contract.content && (
                <>
                  <h4>合同内容</h4>
                  <div style={{ padding: 12, background: '#f8f9fa', borderRadius: 4, marginBottom: 20, whiteSpace: 'pre-wrap' }}>{contract.content}</div>
                </>
              )}
              
              {contract.plans && contract.plans.length > 0 && (
                <>
                  <h4>付款计划</h4>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead><tr style={{ background: '#f8f9fa' }}><th style={{ padding: 8 }}>阶段</th><th>类型</th><th>金额</th><th>到期日</th><th>状态</th></tr></thead>
                    <tbody>
                      {contract.plans.map(p => (
                        <tr key={p.id} style={{ borderBottom: '1px solid #e9ecef' }}>
                          <td style={{ padding: 8 }}>{p.stage}</td>
                          <td>{p.type === 'payment' ? '付款' : '收款'}</td>
                          <td>¥{formatMoney(p.amount)}</td>
                          <td>{formatDate(p.dueDate)}</td>
                          <td>{p.status === 0 ? '待处理' : '已完成'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}