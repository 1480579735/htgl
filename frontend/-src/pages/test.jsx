import React from 'react';
import api from '../core/api';

export default function Test() {
  const [data, setData] = React.useState(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState(null);

  const testApi = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await api.get('/test');
      setData(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const testContracts = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await api.get('/contracts');
      setData(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const testCustomers = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await api.get('/customers');
      setData(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const testSuppliers = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await api.get('/suppliers');
      setData(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>API 测试页面</h2>
      <div style={{ marginBottom: 20, display: 'flex', gap: 10 }}>
        <button onClick={testApi}>测试 /api/test</button>
        <button onClick={testContracts}>测试 /api/contracts</button>
        <button onClick={testCustomers}>测试 /api/customers</button>
        <button onClick={testSuppliers}>测试 /api/suppliers</button>
      </div>
      
      {loading && <div>加载中...</div>}
      {error && <div style={{ color: 'red' }}>错误: {error}</div>}
      {data && (
        <pre style={{ background: '#f5f5f5', padding: 10, borderRadius: 4, overflow: 'auto' }}>
          {JSON.stringify(data, null, 2)}
        </pre>
      )}
    </div>
  );
}