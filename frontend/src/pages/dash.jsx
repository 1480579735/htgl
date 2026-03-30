import React, { useState, useEffect, useCallback } from 'react';
import api from '../core/api';
import { formatMoney } from '../shared/utils';

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    executingCount: 0,
    activeAmount: 0,
    avgAmount: 0
  });
  const [expiring, setExpiring] = useState([]);
  const [topSuppliers, setTopSuppliers] = useState([]);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [autoRefresh, setAutoRefresh] = useState(true);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [statsData, expiringData, topData] = await Promise.all([
        api.get('/contracts/stats/dashboard'),
        api.get('/contracts/expiring/list', { days: 30 }),
        api.get('/suppliers/top/list', { limit: 5 })
      ]);
      setStats(statsData);
      setExpiring(expiringData || []);
      setTopSuppliers(topData || []);
      setLastUpdate(new Date());
    } catch (err) {
      console.error('加载数据失败:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
  }, [autoRefresh, loadData]);

  const formatTime = (date) => {
    return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}:${date.getSeconds().toString().padStart(2, '0')}`;
  };

  const getDaysLeft = (endDate) => {
    if (!endDate) return 0;
    const end = new Date(endDate);
    const now = new Date();
    const diff = end - now;
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  const getStatusText = (status) => {
    const map = { 0: '草稿', 1: '待批', 2: '生效', 3: '执行', 4: '完成', 5: '终止' };
    return map[status] || '未知';
  };

  // 统计卡片样式
  const statsGridStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '20px',
    marginBottom: '32px'
  };

  const statCardStyle = {
    background: 'white',
    padding: '20px',
    borderRadius: '12px',
    textAlign: 'center',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
    transition: 'transform 0.2s, box-shadow 0.2s'
  };

  const statValueStyle = {
    fontSize: '32px',
    fontWeight: 'bold',
    background: 'linear-gradient(135deg, #3498db 0%, #2c3e50 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
    marginBottom: '8px'
  };

  const statLabelStyle = {
    color: '#64748b',
    fontSize: '14px',
    fontWeight: '500'
  };

  // 表格样式
  const tableHeaderStyle = {
    display: 'grid',
    gridTemplateColumns: '1fr 1.5fr 1fr 1fr 0.8fr 0.8fr',
    background: '#f8fafc',
    padding: '12px 16px',
    fontWeight: 'bold',
    borderBottom: '1px solid #e2e8f0'
  };

  const tableRowStyle = {
    display: 'grid',
    gridTemplateColumns: '1fr 1.5fr 1fr 1fr 0.8fr 0.8fr',
    padding: '12px 16px',
    borderBottom: '1px solid #f1f5f9',
    alignItems: 'center'
  };

  const supplierHeaderStyle = {
    display: 'grid',
    gridTemplateColumns: '1fr 1.5fr 1fr 1fr 1fr',
    background: '#f8fafc',
    padding: '12px 16px',
    fontWeight: 'bold',
    borderBottom: '1px solid #e2e8f0'
  };

  const supplierRowStyle = {
    display: 'grid',
    gridTemplateColumns: '1fr 1.5fr 1fr 1fr 1fr',
    padding: '12px 16px',
    borderBottom: '1px solid #f1f5f9',
    alignItems: 'center'
  };

  if (loading) {
    return <div className="loading">加载中...</div>;
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h2>仪表盘</h2>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <span style={{ fontSize: 12, color: '#666' }}>最后更新: {formatTime(lastUpdate)}</span>
          <button className="btn-sm" onClick={loadData}>🔄 刷新</button>
          <button 
            className={`btn-sm ${autoRefresh ? 'btn-success' : 'btn-secondary'}`}
            onClick={() => setAutoRefresh(!autoRefresh)}
          >
            {autoRefresh ? '⏸ 自动刷新中' : '▶ 自动刷新关闭'}
          </button>
        </div>
      </div>
      
      {/* 合同统计卡片 */}
      <h3>合同统计</h3>
      <div style={statsGridStyle}>
        <div style={statCardStyle}>
          <div style={statValueStyle}>{stats.total || 0}</div>
          <div style={statLabelStyle}>合同总数</div>
        </div>
        <div style={statCardStyle}>
          <div style={statValueStyle}>{stats.executingCount || 0}</div>
          <div style={statLabelStyle}>执行中</div>
        </div>
        <div style={statCardStyle}>
          <div style={statValueStyle}>{stats.pending || 0}</div>
          <div style={statLabelStyle}>待审批</div>
        </div>
        <div style={statCardStyle}>
          <div style={statValueStyle}>{expiring.length}</div>
          <div style={statLabelStyle}>即将到期</div>
        </div>
        <div style={statCardStyle}>
          <div style={statValueStyle}>¥{formatMoney(stats.activeAmount || 0)}</div>
          <div style={statLabelStyle}>执行中金额</div>
        </div>
        <div style={statCardStyle}>
          <div style={statValueStyle}>¥{formatMoney(stats.avgAmount || 0)}</div>
          <div style={statLabelStyle}>平均金额</div>
        </div>
      </div>
      
      {/* 供应商统计 */}
      <h3>供应商统计</h3>
      <div style={statsGridStyle}>
        <div style={statCardStyle}>
          <div style={statValueStyle}>{topSuppliers.length}</div>
          <div style={statLabelStyle}>优质供应商</div>
        </div>
      </div>
      
      {/* 即将到期合同 */}
      <div style={{ background: 'white', borderRadius: 12, padding: 20, marginBottom: 24 }}>
        <h3>即将到期合同</h3>
        {expiring.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 40, color: '#666' }}>暂无即将到期的合同</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <div style={tableHeaderStyle}>
              <div>合同编号</div>
              <div>合同名称</div>
              <div>合作方</div>
              <div>到期日</div>
              <div>剩余天数</div>
              <div>状态</div>
            </div>
            {expiring.slice(0, 10).map(item => (
              <div key={item.id} style={tableRowStyle}>
                <div>{item.code}</div>
                <div>{item.title}</div>
                <div>{item.party_name || '-'}</div>
                <div>{new Date(item.expiry_date).toLocaleDateString()}</div>
                <div className={getDaysLeft(item.expiry_date) <= 7 ? 'urgent' : ''}>
                  {getDaysLeft(item.expiry_date)}天
                </div>
                <div>{getStatusText(item.status)}</div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* TOP供应商 */}
      {topSuppliers.length > 0 && (
        <div style={{ background: 'white', borderRadius: 12, padding: 20 }}>
          <h3>优质供应商 TOP5</h3>
          <div style={{ overflowX: 'auto' }}>
            <div style={supplierHeaderStyle}>
              <div>编码</div>
              <div>名称</div>
              <div>联系人</div>
              <div>电话</div>
              <div>等级</div>
            </div>
            {topSuppliers.map(item => (
              <div key={item.id} style={supplierRowStyle}>
                <div>{item.code}</div>
                <div>{item.name}</div>
                <div>{item.contact || '-'}</div>
                <div>{item.phone || '-'}</div>
                <div>
                  {[...Array(5)].map((_, i) => (
                    <span key={i} style={{ color: i < item.rating ? '#f39c12' : '#ddd' }}>★</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}