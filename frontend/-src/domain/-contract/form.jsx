// 在文件顶部添加导入
import eventBus from '../../core/eventBus';

// 修改 handleSubmit 函数中的成功部分
const handleSubmit = async (e) => {
  e.preventDefault();
  if (!validate()) return;
  
  setSubmitting(true);
  try {
    if (contractId) {
      await api.put(`/contracts/${contractId}`, data);
      alert('更新成功');
    } else {
      await api.post('/contracts', data);
      alert('创建成功');
    }
    eventBus.emit('dataChanged'); // 通知数据变更
    onSuccess();
  } catch (err) {
    console.error('保存合同失败:', err);
    alert(err.message);
  } finally {
    setSubmitting(false);
  }
};