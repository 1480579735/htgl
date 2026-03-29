import eventBus from '../../core/eventBus';

// 修改 onDelete 函数
const onDelete = async (id) => {
  if (window.confirm('确定删除该客户吗？')) {
    try {
      await api.delete(`/customers/${id}`);
      alert('删除成功');
      loadCustomers();
      eventBus.emit('dataChanged'); // 通知数据变更
    } catch (err) {
      alert(err.message);
    }
  }
};

// 修改 onUpdateRisk 函数
const onUpdateRisk = async (id, risk) => {
  try {
    await api.patch(`/customers/${id}/risk`, { risk });
    alert('更新成功');
    loadCustomers();
    eventBus.emit('dataChanged'); // 通知数据变更
  } catch (err) {
    alert(err.message);
  }
};