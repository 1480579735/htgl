import React, { useState, useEffect } from 'react';
import api from '../core/api';

export default function SystemManage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [form, setForm] = useState({ username: '', realName: '', password: '', role: 'user', status: 1 });
  const [resetTarget, setResetTarget] = useState(null);
  const [newPassword, setNewPassword] = useState('');

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const res = await api.get('/users');
      setUsers(res.list || []);
    } catch (err) {
      console.error('加载用户失败:', err);
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingUser) {
        await api.put(`/users/${editingUser.id}`, {
          realName: form.realName,
          role: form.role,
          status: form.status
        });
        alert('更新成功');
      } else {
        if (!form.username || !form.password) {
          alert('用户名和密码不能为空');
          return;
        }
        await api.post('/users', {
          username: form.username,
          realName: form.realName,
          password: form.password,
          role: form.role
        });
        alert('创建成功');
      }
      setShowModal(false);
      setEditingUser(null);
      resetForm();
      loadUsers();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleReset = async () => {
    if (!newPassword || newPassword.length < 6) {
      alert('密码长度至少6位');
      return;
    }
    try {
      await api.post(`/users/${resetTarget.id}/reset-password`, { newPassword });
      alert('密码已重置');
      setResetTarget(null);
      setNewPassword('');
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDelete = async (user) => {
    if (!window.confirm(`确定删除用户 "${user.username}" 吗？`)) return;
    try {
      await api.delete(`/users/${user.id}`);
      loadUsers();
    } catch (err) {
      alert(err.message);
    }
  };

  const openEditModal = (user) => {
    setEditingUser(user);
    setForm({
      realName: user.real_name,
      role: user.role,
      status: user.status
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setForm({ username: '', realName: '', password: '', role: 'user', status: 1 });
  };

  const getRoleText = (role) => {
    const map = { admin: '管理员', manager: '经理', user: '普通用户' };
    return map[role] || role;
  };

  const getStatusText = (status) => {
    return status === 1 ? '启用' : '禁用';
  };

  if (loading) {
    return <div className="loading">加载中...</div>;
  }

  // 表头样式
  const headerStyle = {
    display: 'grid',
    gridTemplateColumns: '1.5fr 1.5fr 1fr 0.8fr 1.5fr 1.8fr',
    background: '#f8fafc',
    padding: '12px 16px',
    fontWeight: 'bold',
    borderBottom: '1px solid #e2e8f0'
  };

  const rowStyle = {
    display: 'grid',
    gridTemplateColumns: '1.5fr 1.5fr 1fr 0.8fr 1.5fr 1.8fr',
    padding: '12px 16px',
    borderBottom: '1px solid #f1f5f9',
    alignItems: 'center'
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24 }}>
        <h2>系统管理</h2>
        <button className="btn-primary" onClick={() => { resetForm(); setEditingUser(null); setShowModal(true); }}>
          新增用户
        </button>
      </div>

      <div style={{ overflowX: 'auto', background: 'white', borderRadius: 8 }}>
        <div style={headerStyle}>
          <div>用户名</div>
          <div>姓名</div>
          <div>角色</div>
          <div>状态</div>
          <div>创建时间</div>
          <div>操作</div>
        </div>
        
        {users.map(user => (
          <div key={user.id} style={rowStyle}>
            <div>{user.username}</div>
            <div>{user.real_name}</div>
            <div>{getRoleText(user.role)}</div>
            <div>{getStatusText(user.status)}</div>
            <div>{new Date(user.created_at).toLocaleDateString()}</div>
            <div>
              <div className="button-group">
                <button className="btn-sm" onClick={() => openEditModal(user)}>编辑</button>
                <button className="btn-sm" onClick={() => { setResetTarget(user); setNewPassword(''); }}>重置密码</button>
                <button className="btn-sm btn-danger" onClick={() => handleDelete(user)}>删除</button>
              </div>
            </div>
          </div>
        ))}
        
        {users.length === 0 && !loading && (
          <div style={{ textAlign: 'center', padding: 40, color: '#666' }}>暂无数据</div>
        )}
      </div>

      {/* 用户表单弹窗 */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editingUser ? '编辑用户' : '新增用户'}</h3>
              <button className="close" onClick={() => setShowModal(false)}>&times;</button>
            </div>
            <form onSubmit={handleSubmit}>
              {!editingUser && (
                <>
                  <div className="form-group">
                    <label>用户名 *</label>
                    <input type="text" value={form.username} onChange={e => setForm({ ...form, username: e.target.value })} required />
                  </div>
                  <div className="form-group">
                    <label>密码 *</label>
                    <input type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required />
                  </div>
                </>
              )}
              <div className="form-group">
                <label>姓名 *</label>
                <input type="text" value={form.realName} onChange={e => setForm({ ...form, realName: e.target.value })} required />
              </div>
              <div className="form-group">
                <label>角色</label>
                <select value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}>
                  <option value="user">普通用户</option>
                  <option value="manager">经理</option>
                  <option value="admin">管理员</option>
                </select>
              </div>
              {editingUser && (
                <div className="form-group">
                  <label>状态</label>
                  <select value={form.status} onChange={e => setForm({ ...form, status: parseInt(e.target.value) })}>
                    <option value="1">启用</option>
                    <option value="0">禁用</option>
                  </select>
                </div>
              )}
              <div className="form-actions">
                <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>取消</button>
                <button type="submit" className="btn-primary">保存</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 重置密码弹窗 */}
      {resetTarget && (
        <div className="modal-overlay" onClick={() => setResetTarget(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>重置密码 - {resetTarget.username}</h3>
              <button className="close" onClick={() => setResetTarget(null)}>&times;</button>
            </div>
            <div style={{ padding: 20 }}>
              <div className="form-group">
                <label>新密码</label>
                <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="至少6位" />
              </div>
            </div>
            <div className="form-actions">
              <button className="btn-secondary" onClick={() => setResetTarget(null)}>取消</button>
              <button className="btn-primary" onClick={handleReset}>确认重置</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}