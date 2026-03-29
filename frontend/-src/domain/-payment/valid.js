export function checkStage(stage) {
  if (!stage || stage.trim() === '') {
    return '付款阶段不能为空';
  }
  if (stage.length > 100) {
    return '付款阶段过长';
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
  return null;
}

export function checkDueDate(date) {
  if (!date) {
    return '到期日期不能为空';
  }
  const due = new Date(date);
  if (isNaN(due.getTime())) {
    return '到期日期无效';
  }
  return null;
}

export function checkPayment(data) {
  const errors = [];
  
  const stageErr = checkStage(data.stage);
  if (stageErr) errors.push(stageErr);
  
  const amtErr = checkAmount(data.amount);
  if (amtErr) errors.push(amtErr);
  
  const dateErr = checkDueDate(data.dueDate);
  if (dateErr) errors.push(dateErr);
  
  return {
    ok: errors.length === 0,
    errors
  };
}