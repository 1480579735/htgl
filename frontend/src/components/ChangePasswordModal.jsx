import React, { useState } from 'react';
import api from '../core/api';

export default function ChangePasswordModal({ visible, onClose, onSuccess }) {
  const [form, setForm] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.newPassword !== form.confirmPassword) return setError('两次输入的新密码不一致');
    if (form.newPassword.length < 6) return setError('新密码长度至少6位');
    setLoading(true);
    try {
      await api.post('/users/change-password', { oldPassword: form.oldPassword, newPassword: form.newPassword });
      alert('密码修改成功，请重新登录');
      onSuccess();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!visible) return null;
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>修改密码</h3>
          <button className="close" onClick={onClose}>&times;</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>原密码</label>
            <input type="password" value={form.oldPassword} onChange={e => setForm({...form, oldPassword: e.target.value})} required />
          </div>
          <div className="form-group">
            <label>新密码</label>
            <input type="password" value={form.newPassword} onChange={e => setForm({...form, newPassword: e.target.value})} required />
          </div>
          <div className="form-group">
            <label>确认新密码</label>
            <input type="password" value={form.confirmPassword} onChange={e => setForm({...form, confirmPassword: e.target.value})} required />
          </div>
          {error && <div className="error-msg">{error}</div>}
          <div className="form-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>取消</button>
            <button type="submit" className="btn-primary" disabled={loading}>{loading ? '修改中' : '确认修改'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}