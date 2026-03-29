import React, { useState } from 'react';

let confirmInstance = null;

export function confirm(options) {
  return new Promise((resolve) => {
    if (confirmInstance) {
      confirmInstance.show(options, resolve);
    } else {
      resolve(false);
    }
  });
}

export function ConfirmContainer() {
  const [visible, setVisible] = useState(false);
  const [options, setOptions] = useState({ title: '', message: '', confirmText: '确定', cancelText: '取消' });
  const [resolveFn, setResolveFn] = useState(null);
  
  useEffect(() => {
    confirmInstance = { show };
    return () => {
      confirmInstance = null;
    };
  }, []);
  
  const show = (opts, resolve) => {
    setOptions({ ...options, ...opts });
    setResolveFn(() => resolve);
    setVisible(true);
  };
  
  const handleConfirm = () => {
    setVisible(false);
    if (resolveFn) resolveFn(true);
  };
  
  const handleCancel = () => {
    setVisible(false);
    if (resolveFn) resolveFn(false);
  };
  
  if (!visible) return null;
  
  return (
    <div className="modal-overlay" onClick={handleCancel}>
      <div className="modal-content confirm-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{options.title || '提示'}</h3>
        </div>
        <div className="modal-body">
          <p>{options.message}</p>
        </div>
        <div className="modal-footer">
          <button className="btn-secondary" onClick={handleCancel}>
            {options.cancelText || '取消'}
          </button>
          <button className="btn-primary" onClick={handleConfirm}>
            {options.confirmText || '确定'}
          </button>
        </div>
      </div>
    </div>
  );
}