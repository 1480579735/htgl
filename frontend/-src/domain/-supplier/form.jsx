import eventBus from '../../core/eventBus';

// 在 handleSubmit 成功部分添加
const handleSubmit = async (e) => {
  e.preventDefault();
  if (!validate()) return;
  
  setSubmitting(true);
  try {
    if (supplierId) {
      await store.update(supplierId, form);
      alert('更新成功');
    } else {
      await store.create(form);
      alert('创建成功');
    }
    eventBus.emit('dataChanged'); // 通知数据变更
    onSuccess();
  } catch (err) {
    alert(err.message);
  } finally {
    setSubmitting(false);
  }
};