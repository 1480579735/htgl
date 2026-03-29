import eventBus from '../../core/eventBus';

// 修改 onRecordPay 函数
const onRecordPay = async (paymentId, data) => {
  try {
    await api.post(`/payments/${paymentId}/pay`, data);
    alert('记录成功');
    setShowPayModal(false);
    loadPayments();
    eventBus.emit('dataChanged'); // 通知数据变更
  } catch (err) {
    alert(err.message);
  }
};

// 修改 onDelete 函数
const onDelete = async (id) => {
  if (window.confirm('确定删除该付款计划吗？')) {
    try {
      await api.delete(`/payments/${id}`);
      alert('删除成功');
      loadPayments();
      eventBus.emit('dataChanged'); // 通知数据变更
    } catch (err) {
      alert(err.message);
    }
  }
};