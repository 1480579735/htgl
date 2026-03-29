import eventBus from '../../core/eventBus';

// 修改 onUpdateStatus 函数
const onUpdateStatus = async (id, status) => {
  const action = status === 1 ? '启用' : '停用';
  if (window.confirm(`确定${action}该供应商吗？`)) {
    try {
      await store.updateStatus(id, status);
      alert(`${action}成功`);
      loadSuppliers();
      eventBus.emit('dataChanged'); // 通知数据变更
    } catch (err) {
      alert(err.message);
    }
  }
};

// 修改 onUpdateRating 函数
const onUpdateRating = async (id, rating) => {
  const ratingText = { 1: '一星', 2: '二星', 3: '三星', 4: '四星', 5: '五星' };
  if (window.confirm(`确定将供应商等级改为${ratingText[rating]}吗？`)) {
    try {
      await store.updateRating(id, rating);
      alert('等级更新成功');
      loadSuppliers();
      eventBus.emit('dataChanged'); // 通知数据变更
    } catch (err) {
      alert(err.message);
    }
  }
};

// 修改 onDelete 函数
const onDelete = async (id) => {
  if (window.confirm('确定删除该供应商吗？')) {
    try {
      await store.delete(id);
      alert('删除成功');
      loadSuppliers();
      eventBus.emit('dataChanged'); // 通知数据变更
    } catch (err) {
      alert(err.message);
    }
  }
};