const { STATUS, TYPE } = require('./enums');

function checkName(name) {
  if (!name || name.trim() === '') {
    return '合同名称不能为空';
  }
  if (name.length > 100) {
    return '合同名称不能超过100个字符';
  }
  return null;
}

function checkAmount(amt) {
  if (!amt && amt !== 0) {
    return '合同金额不能为空';
  }
  if (amt <= 0) {
    return '合同金额必须大于0';
  }
  if (amt > 100000000) {
    return '合同金额不能超过1亿元';
  }
  return null;
}

function checkDate(start, end) {
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

function checkType(type) {
  const types = ['purchase', 'sales', 'service', 'lease'];
  if (!types.includes(type)) {
    return '合同类型无效';
  }
  return null;
}

function checkContract(data) {
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

module.exports = {
  checkName,
  checkAmount,
  checkDate,
  checkType,
  checkContract
};