import React, { useState, useEffect } from 'react';

let toastInstance = null;

export function showToast(message, type = 'info', duration = 3000) {
  if (toastInstance) {
    toastInstance.show(message, type, duration);
  }
}

export function ToastContainer() {
  const [visible, setVisible] = useState(false);
  const [message, setMessage] = useState('');
  const [type, setType] = useState('info');
  const [timeoutId, setTimeoutId] = useState(null);
  
  useEffect(() => {
    toastInstance = { show };
    return () => {
      toastInstance = null;
    };
  }, []);
  
  const show = (msg, t, dur) => {
    if (timeoutId) clearTimeout(timeoutId);
    setMessage(msg);
    setType(t);
    setVisible(true);
    
    const id = setTimeout(() => {
      setVisible(false);
    }, dur);
    setTimeoutId(id);
  };
  
  if (!visible) return null;
  
  const icons = {
    success: '✓',
    error: '✗',
    warning: '⚠',
    info: 'ℹ'
  };
  
  return (
    <div className={`toast toast-${type}`}>
      <span className="toast-icon">{icons[type]}</span>
      <span className="toast-message">{message}</span>
    </div>
  );
}