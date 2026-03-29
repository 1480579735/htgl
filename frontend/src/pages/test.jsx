import React, { useState } from 'react';
import api from '../core/api';

export default function Test() {
  const [contracts, setContracts] = useState(null);
  const [customers, setCustomers] = useState(null);
  const [suppliers, setSuppliers] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const testContracts = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await api.get('/contracts');
      setContracts(result);
      console.log('合同数据:', result);
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
      setCustomers(result);
      console.log('客户数据:', result);
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
      setSuppliers(result);
      console.log('供应商数据:', result);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const clearData = () => {
    setContracts(null);
    setCustomers(null);
    setSuppliers(null);
    setError(null);
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>API 测试页面</h2>
      <p>点击按钮测试后端API是否正常返回数据</p>
      
      <div style={{ marginBottom: 20, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        <button onClick={testContracts} style={{ padding: '8px 16px', background: '#3498db', color: 'white', border: 'none', borderRadius: 4, cursor: 'pointer' }}>测试合同API</button>
        <button onClick={testCustomers} style={{ padding: '8px 16px', background: '#27ae60', color: 'white', border: 'none', borderRadius: 4, cursor: 'pointer' }}>测试客户API</button>
        <button onClick={testSuppliers} style={{ padding: '8px 16px', background: '#f39c12', color: 'white', border: 'none', borderRadius: 4, cursor: 'pointer' }}>测试供应商API</button>
        <button onClick={clearData} style={{ padding: '8px 16px', background: '#95a5a6', color: 'white', border: 'none', borderRadius: 4, cursor: 'pointer' }}>清空数据</button>
      </div>
      
      {loading && <div style={{ textAlign: 'center', padding: 20 }}>加载中...</div>}
      
      {error && (
        <div style={{ marginTop: 20, padding: 15, background: '#fee', border: '1px solid #e74c3c', borderRadius: 4 }}>
          <h3 style={{ color: '#e74c3c', marginBottom: 10 }}>错误:</h3>
          <pre style={{ color: '#e74c3c' }}>{error}</pre>
        </div>
      )}
      
      {contracts && (
        <div style={{ marginTop: 20 }}>
          <h3 style={{ marginBottom: 10 }}>合同API返回数据:</h3>
          <div style={{ background: '#f5f5f5', padding: 10, borderRadius: 4, overflow: 'auto', maxHeight: 400 }}>
            <pre style={{ margin: 0 }}>{JSON.stringify(contracts, null, 2)}</pre>
          </div>
        </div>
      )}
      
      {customers && (
        <div style={{ marginTop: 20 }}>
          <h3 style={{ marginBottom: 10 }}>客户API返回数据:</h3>
          <div style={{ background: '#f5f5f5', padding: 10, borderRadius: 4, overflow: 'auto', maxHeight: 400 }}>
            <pre style={{ margin: 0 }}>{JSON.stringify(customers, null, 2)}</pre>
          </div>
        </div>
      )}
      
      {suppliers && (
        <div style={{ marginTop: 20 }}>
          <h3 style={{ marginBottom: 10 }}>供应商API返回数据:</h3>
          <div style={{ background: '#f5f5f5', padding: 10, borderRadius: 4, overflow: 'auto', maxHeight: 400 }}>
            <pre style={{ margin: 0 }}>{JSON.stringify(suppliers, null, 2)}</pre>
          </div>
        </div>
      )}
      
      <div style={{ marginTop: 30, padding: 15, background: '#e8f4fd', borderRadius: 4 }}>
        <h4>使用说明:</h4>
        <ul style={{ marginLeft: 20, lineHeight: 1.6 }}>
          <li>点击"测试合同API"查看合同列表数据</li>
          <li>点击"测试客户API"查看客户列表数据</li>
          <li>点击"测试供应商API"查看供应商列表数据</li>
          <li>打开浏览器开发者工具(F12)查看Console控制台的详细日志</li>
          <li>如果返回错误，请检查后端服务是否正常运行</li>
        </ul>
      </div>
    </div>
  );
}