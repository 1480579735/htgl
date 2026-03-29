import React from 'react';

export default function Dashboard() {
  const stats = [
    { label: '合同总数', value: 0, color: '#3498db' },
    { label: '执行中', value: 0, color: '#27ae60' },
    { label: '待审批', value: 0, color: '#f39c12' },
    { label: '即将到期', value: 0, color: '#e74c3c' }
  ];
  
  return (
    <div>
      <h2 style={{ marginBottom: 24, fontSize: 24 }}>欢迎使用合同管理系统</h2>
      
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', 
        gap: 20,
        marginBottom: 32
      }}>
        {stats.map((stat, index) => (
          <div 
            key={index}
            style={{ 
              background: 'white', 
              padding: 24, 
              borderRadius: 8, 
              boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
              textAlign: 'center',
              transition: 'transform 0.2s'
            }}
          >
            <div style={{ fontSize: 36, fontWeight: 'bold', color: stat.color, marginBottom: 8 }}>
              {stat.value}
            </div>
            <div style={{ color: '#666', fontSize: 14 }}>{stat.label}</div>
          </div>
        ))}
      </div>
      
      <div style={{ 
        background: 'white', 
        padding: 20, 
        borderRadius: 8, 
        boxShadow: '0 1px 2px rgba(0,0,0,0.05)' 
      }}>
        <h3 style={{ marginBottom: 16, fontSize: 18 }}>系统状态</h3>
        <p style={{ color: '#666', lineHeight: 1.6 }}>
          系统运行正常，您可以开始使用各项功能。
        </p>
        <ul style={{ marginTop: 16, paddingLeft: 20, color: '#666' }}>
          <li>合同管理 - 创建、编辑、审批合同</li>
          <li>客户管理 - 管理客户信息</li>
          <li>供应商管理 - 管理供应商信息</li>
          <li>收付款管理 - 跟踪合同收付款计划</li>
        </ul>
      </div>
    </div>
  );
}