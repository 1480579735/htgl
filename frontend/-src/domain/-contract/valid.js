export function checkName(name) {
  if (!name || name.trim() === '') {
    return '名称不能为空';
  }
  if (name.length > 100) {
    return '名称过长';
  }
  return null;
}

export function checkAmount(amt) {
  if (!amt && amt !== 0) {
    return '金额不能为空';
  }
  if (amt <= 0) {
    return '金额必须大于0';
  }
  if (amt > 100000000) {
    return '金额过大';
  }
  return null;
}

export function checkDate(start, end) {
  if (!start || !end) return null;
  const startDate = new Date(start);
  const endDate = new Date(end);
  if (startDate >= endDate) {
    return '开始日期必须早于结束日期';
  }
  const days = (endDate - startDate) / 86400000;
  if (days > 3650) {
    return '合同期限不能超过10年';
  }
  return null;
}

export function checkType(type) {
  const types = ['purchase', 'sales', 'service', 'lease'];
  if (!types.includes(type)) {
    return '合同类型无效';
  }
  return null;
}

export function checkContract(data) {
  const errors = [];
  
  const nameErr = checkName(data.name);
  if (nameErr) errors.push(nameErr);
  
  const amtErr = checkAmount(data.amount);
  if (amtErr) errors.push(amtErr);
  
  const dateErr = checkDate(data.startDate, data.endDate);
  if (dateErr) errors.push(dateErr);
  
  const typeErr = checkType(data.type);
  if (typeErr) errors.push(typeErr);
  
  if (!data.custId) {
    errors.push('请选择客户');
  }
  
  return {
    ok: errors.length === 0,
    errors
  };
}