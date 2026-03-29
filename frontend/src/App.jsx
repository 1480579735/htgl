import React, { useState, useEffect } from 'react';
import api from './core/api';
import eventBus from './core/eventBus';
import Login from './pages/login';
import Dashboard from './pages/dash';
import ContractList from './domain/contract/list';
import ContractForm from './domain/contract/form';
import ContractDetail from './domain/contract/detail';
import CustomerList from './domain/customer/list';
import CustomerForm from './domain/customer/form';
import SupplierList from './domain/supplier/list';
import SupplierForm from './domain/supplier/form';
import PaymentList from './domain/payment/list';
import PaymentForm from './domain/payment/form';
import MainLayout from './layout/main';
import './style/main.css';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentPath, setCurrentPath] = useState(window.location.pathname);
  const [showContractForm, setShowContractForm] = useState(false);
  const [showContractDetail, setShowContractDetail] = useState(false);
  const [showCustomerForm, setShowCustomerForm] = useState(false);
  const [showSupplierForm, setShowSupplierForm] = useState(false);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [selectedContractId, setSelectedContractId] = useState(null);
  const [selectedCustomerId, setSelectedCustomerId] = useState(null);
  const [selectedSupplierId, setSelectedSupplierId] = useState(null);
  const [selectedPaymentId, setSelectedPaymentId] = useState(null);
  
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      api.setToken(token);
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setUser({ id: payload.id, name: payload.name, role: payload.role });
      } catch (e) {}
    }
    setLoading(false);
    window.addEventListener('popstate', () => setCurrentPath(window.location.pathname));
    return () => window.removeEventListener('popstate', () => setCurrentPath(window.location.pathname));
  }, []);
  
  const navigate = (path) => {
    window.history.pushState({}, '', path);
    setCurrentPath(path);
  };
  
  const handleLogin = (userData) => {
    setUser(userData);
    navigate('/');
  };
  
  const refreshData = () => eventBus.emit('dataChanged');
  
  const closeContractForm = () => { setShowContractForm(false); setSelectedContractId(null); refreshData(); };
  const closeContractDetail = () => { setShowContractDetail(false); setSelectedContractId(null); };
  const closeCustomerForm = () => { setShowCustomerForm(false); setSelectedCustomerId(null); refreshData(); };
  const closeSupplierForm = () => { setShowSupplierForm(false); setSelectedSupplierId(null); refreshData(); };
  const closePaymentForm = () => { setShowPaymentForm(false); setSelectedPaymentId(null); refreshData(); };
  
  const isLogin = !!api.token;
  
  if (loading) return <div className="loading">加载中...</div>;
  if (!isLogin && currentPath !== '/login') return <Login onLogin={handleLogin} />;
  if (currentPath === '/login') return <Login onLogin={handleLogin} />;
  
  const renderContent = () => {
    if (currentPath === '/') return <Dashboard />;
    if (currentPath === '/contracts') return <ContractList onEdit={(id) => { setSelectedContractId(id); setShowContractForm(true); }} onView={(id) => { setSelectedContractId(id); setShowContractDetail(true); }} />;
    if (currentPath === '/customers') return <CustomerList onEdit={(id) => { setSelectedCustomerId(id); setShowCustomerForm(true); }} />;
    if (currentPath === '/suppliers') return <SupplierList onEdit={(id) => { setSelectedSupplierId(id); setShowSupplierForm(true); }} />;
    if (currentPath === '/payments') return <PaymentList onAdd={() => setShowPaymentForm(true)} />;
    return <Dashboard />;
  };
  
  return (
    <>
      <MainLayout user={user} currentPath={currentPath} onNavigate={navigate}>
        {renderContent()}
      </MainLayout>
      <ContractForm visible={showContractForm} contractId={selectedContractId} onClose={closeContractForm} onSuccess={closeContractForm} />
      <ContractDetail visible={showContractDetail} contractId={selectedContractId} onClose={closeContractDetail} />
      <CustomerForm visible={showCustomerForm} customerId={selectedCustomerId} onClose={closeCustomerForm} onSuccess={closeCustomerForm} />
      <SupplierForm visible={showSupplierForm} supplierId={selectedSupplierId} onClose={closeSupplierForm} onSuccess={closeSupplierForm} />
      <PaymentForm visible={showPaymentForm} paymentId={selectedPaymentId} onClose={closePaymentForm} onSuccess={closePaymentForm} />
    </>
  );
}

export default App;