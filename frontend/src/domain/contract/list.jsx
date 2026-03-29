import React, { useState, useEffect } from 'react';
import api from '../../core/api';
import eventBus from '../../core/eventBus';
import { formatMoney } from '../../shared/utils';

export default function ContractList({ onEdit, onView }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [list, setList] = useState([]);
  const [page, setPage] = useState({ cur: 1, size: 20, total: 0, pages: 0 });
  const [filter, setFilter] = useState({ status: '', type: '', direction: '', kw: '' });
  
  useEffect(() => {
    loadContracts();
  }, [page.cur, filter]);
  
  const loadContracts = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {
        page: page.cur,
        size: page.size,
        ...filter
      };
      if (!params.status) delete params.status;
      if (!params.type) delete params.type;
      if (!params.direction) delete params.direction;
      if (!params.kw) delete params.kw;
      
      const result = await api.get('/contracts', params);
      setList(result.list || []);
      setPage({
        cur: result.page,
        size: result.size,
        total: result.total,
        pages: result.pages
      });
    } catch (err) {
      console.error('加载合同失败:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  
  const onSearch = (kw) => {
    setFilter({ ...filter, kw });
    setPage({ ...page, cur: 1 });
  };
  
  const onStatusChange = (status) => {
    setFilter({ ...filter, status });
    setPage({ ...page, cur: 1 });
  };
  
  const onTypeChange = (type) => {
    setFilter({ ...filter, type });
    setPage({ ...page, cur: 1 });
  };
  
  const onDirectionChange = (direction) => {
    setFilter({ ...filter, direction });
    setPage({ ...page, cur: 1 });
  };
  
  const onPageChange = (newPage) => {
    setPage({ ...page, cur: newPage });
  };
  
  const handleSubmit = async (id) => {
    if (window.confirm('确定提交审批吗？')) {
      try {
        await api.post(`/contracts/${id}/submit`);
        alert('提交成功');
        loadContracts();
        eventBus.emit('dataChanged');
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
        eventBus.emit('dataChanged');
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
        eventBus.emit('dataChanged');
      } catch (err) {
        alert(err.message);
      }
    }
  };
  
  const handleFinish = async (id) => {
    if (window.confirm('确定完成该合同吗？')) {
      try {
        await api.post(`/contracts/${id}/finish`);
        alert('已完成');
        loadContracts();
        eventBus.emit('dataChanged');
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
        eventBus.emit('dataChanged');
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
        eventBus.emit('dataChanged');
      } catch (err) {
        alert(err.message);
      }
    }
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
  
  if (loading && list.length === 0) {
    return <div className="loading">加载中...</div>;
  }
  
  if (error) {
    return <div className="error">错误: {error}</div>;
  }
  
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h2>合同管理</h2>
        <button className="btn-primary" onClick={() => onEdit && onEdit(null)}>新建合同</button>
      </div>
      
      <div className="filters">
        <input
          type="text"
          placeholder="搜索合同编号/名称"
          value={filter.kw}
          onChange={(e) => onSearch(e.target.value)}
        />
        <select value={filter.direction} onChange={(e) => onDirectionChange(e.target.value)}>
          <option value="">全部方向</option>
          <option value="1">销项合同</option>
          <option value="2">进项合同</option>
        </select>
        <select value={filter.status} onChange={(e) => onStatusChange(e.target.value)}>
          <option value="">全部状态</option>
          <option value="0">草稿</option>
          <option value="1">待批</option>
          <option value="2">生效</option>
          <option value="3">执行</option>
          <option value="4">完成</option>
          <option value="5">终止</option>
        </select>
        <select value={filter.type} onChange={(e) => onTypeChange(e.target.value)}>
          <option value="">全部类型</option>
          <option value="purchase">采购</option>
          <option value="sales">销售</option>
          <option value="service">服务</option>
          <option value="lease">租赁</option>
        </select>
      </div>
      
      <div style={{ overflowX: 'auto', background: 'white', borderRadius: 8 }}>
        <table className="data-table">
          <thead>
            <tr>
              <th>编号</th>
              <th>名称</th>
              <th>合同方向</th>
              <th>合作方</th>
              <th>类型</th>
              <th>金额</th>
              <th>状态</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            {list.map(item => (
              <tr key={item.id}>
                <td>{item.code}</td>
                <td>{item.name}</td>
                <td>{getDirectionText(item.direction)}</td>
                <td>{item.cust_name || item.supplier_name || '-'}</td>
                <td>{getTypeText(item.type)}</td>
                <td>¥{formatMoney(item.amount)}</td>
                <td>
                  <span className={`status-badge status-${item.status}`}>
                    {getStatusText(item.status)}
                  </span>
                </td>
                <td>
                  <div className="button-group">
                    <button className="btn-sm" onClick={() => onView && onView(item.id)}>查看</button>
                    {item.status === 0 && (
                      <>
                        <button className="btn-sm" onClick={() => onEdit && onEdit(item.id)}>编辑</button>
                        <button className="btn-sm btn-success" onClick={() => handleSubmit(item.id)}>提交</button>
                        <button className="btn-sm btn-danger" onClick={() => handleDelete(item.id)}>删除</button>
                      </>
                    )}
                    {item.status === 1 && (
                      <>
                        <button className="btn-sm btn-success" onClick={() => handleApprove(item.id, 'pass')}>通过</button>
                        <button className="btn-sm btn-danger" onClick={() => handleApprove(item.id, 'reject')}>驳回</button>
                      </>
                    )}
                    {item.status === 2 && (
                      <button className="btn-sm" onClick={() => handleStart(item.id)}>开始执行</button>
                    )}
                    {item.status === 3 && (
                      <>
                        <button className="btn-sm" onClick={() => handleFinish(item.id)}>完成</button>
                        <button className="btn-sm btn-danger" onClick={() => handleTerminate(item.id)}>终止</button>
                      </>
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
    </div>
  );
}