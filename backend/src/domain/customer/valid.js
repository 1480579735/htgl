function checkName(name) {
  if (!name || name.trim() === '') {
    return '客户名称不能为空';
  }
  if (name.length > 100) {
    return '客户名称不能超过100个字符';
  }
  return null;
}

function checkCode(code) {
  if (!code || code.trim() === '') {
    return '客户编码不能为空';
  }
  if (code.length > 50) {
    return '客户编码不能超过50个字符';
  }
  return null;
}

function checkPhone(phone) {
  if (!phone) return null;
  if (!/^1[3-9]\d{9}$/.test(phone)) {
    return '手机号格式不正确';
  }
  return null;
}

function checkEmail(email) {
  if (!email) return null;
  if (!/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(email)) {
    return '邮箱格式不正确';
  }
  return null;
}

function checkCustomer(data) {
  const errors = [];
  
  const nameErr = checkName(data.name);
  if (nameErr) errors.push(nameErr);
  
  const codeErr = checkCode(data.code);
  if (codeErr) errors.push(codeErr);
  
  const phoneErr = checkPhone(data.phone);
  if (phoneErr) errors.push(phoneErr);
  
  const emailErr = checkEmail(data.email);
  if (emailErr) errors.push(emailErr);
  
  return {
    ok: errors.length === 0,
    errors
  };
}

module.exports = {
  checkName,
  checkCode,
  checkPhone,
  checkEmail,
  checkCustomer
};