// 在文件顶部添加导入
import eventBus from '../../core/eventBus';

// 修改 handleSubmit 函数
const handleSubmit = async (id) => {
  if (window.confirm('确定提交审批吗？')) {
    try {
      await api.post(`/contracts/${id}/submit`);
      alert('提交成功');
      loadContracts();
      eventBus.emit('dataChanged'); // 通知数据变更
    } catch (err) {
      alert(err.message);
    }
  }
};

// 修改 handleApprove 函数
const handleApprove = async (id, result) => {
  const txt = result === 'pass' ? '通过' : '驳回';
  const remark = window.prompt(`请输入${txt}意见：`);
  if (remark !== null) {
    try {
      await api.post(`/contracts/${id}/approve`, { result, remark });
      alert('操作成功');
      loadContracts();
      eventBus.emit('dataChanged'); // 通知数据变更
    } catch (err) {
      alert(err.message);
    }
  }
};

// 修改 handleStart 函数
const handleStart = async (id) => {
  if (window.confirm('确定开始执行该合同吗？')) {
    try {
      await api.post(`/contracts/${id}/start`);
      alert('已开始执行');
      loadContracts();
      eventBus.emit('dataChanged'); // 通知数据变更
    } catch (err) {
      alert(err.message);
    }
  }
};

// 修改 handleFinish 函数
const handleFinish = async (id) => {
  if (window.confirm('确定完成该合同吗？')) {
    try {
      await api.post(`/contracts/${id}/finish`);
      alert('已完成');
      loadContracts();
      eventBus.emit('dataChanged'); // 通知数据变更
    } catch (err) {
      alert(err.message);
    }
  }
};

// 修改 handleTerminate 函数
const handleTerminate = async (id) => {
  const reason = window.prompt('请输入终止原因：');
  if (reason) {
    try {
      await api.post(`/contracts/${id}/terminate`, { reason });
      alert('已终止');
      loadContracts();
      eventBus.emit('dataChanged'); // 通知数据变更
    } catch (err) {
      alert(err.message);
    }
  }
};

// 修改 handleDelete 函数
const handleDelete = async (id) => {
  if (window.confirm('确定删除该合同吗？')) {
    try {
      await api.delete(`/contracts/${id}`);
      alert('删除成功');
      loadContracts();
      eventBus.emit('dataChanged'); // 通知数据变更
    } catch (err) {
      alert(err.message);
    }
  }
};