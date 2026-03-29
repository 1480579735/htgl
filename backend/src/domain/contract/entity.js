const { STATUS, TYPE, DIRECTION } = require('./enums');

class Contract {
  constructor(data = {}) {
    this.id = data.id || null;
    this.code = data.code || '';
    this.name = data.name || '';
    this.type = data.type || TYPE.PURCHASE;
    this.direction = data.direction !== undefined ? data.direction : DIRECTION.SALES;
    this.amount = data.amount || 0;
    this.currency = data.currency || 'CNY';
    this.custId = data.custId || null;
    this.custName = data.custName || '';
    this.supplierId = data.supplierId || null;
    this.supplierName = data.supplierName || '';
    this.status = data.status !== undefined ? data.status : STATUS.DRAFT;
    this.signDate = data.signDate ? new Date(data.signDate) : null;
    this.startDate = data.startDate ? new Date(data.startDate) : null;
    this.endDate = data.endDate ? new Date(data.endDate) : null;
    this.content = data.content || '';
    this.plans = data.plans || [];
    this.attachments = data.attachments || [];
    this.createdBy = data.createdBy || null;
    this.createdAt = data.createdAt ? new Date(data.createdAt) : null;
    this.updatedAt = data.updatedAt ? new Date(data.updatedAt) : null;
  }

  validate() {
    const errors = [];

    if (!this.name || this.name.trim() === '') {
      errors.push('合同名称不能为空');
    } else if (this.name.length > 100) {
      errors.push('合同名称不能超过100个字符');
    }

    if (this.amount <= 0) {
      errors.push('合同金额必须大于0');
    } else if (this.amount > 100000000) {
      errors.push('合同金额不能超过1亿元');
    }

    // 根据合同方向验证关联方
    if (this.direction === DIRECTION.SALES) {
      if (!this.custId) {
        errors.push('销售合同必须选择客户');
      }
    } else if (this.direction === DIRECTION.PURCHASE) {
      if (!this.supplierId) {
        errors.push('采购合同必须选择供应商');
      }
    }

    if (this.startDate && this.endDate) {
      if (this.startDate >= this.endDate) {
        errors.push('开始日期必须早于结束日期');
      }
      const days = (this.endDate - this.startDate) / 86400000;
      if (days > 3650) {
        errors.push('合同期限不能超过10年');
      }
    }

    if (errors.length) {
      throw new Error(errors.join('；'));
    }
    return true;
  }

  submit() {
    if (this.status !== STATUS.DRAFT) {
      throw new Error('只有草稿状态的合同才能提交审批');
    }
    this.validate();
    this.status = STATUS.PENDING;
    this.updatedAt = new Date();
    return { event: 'submitted', id: this.id };
  }

  approve() {
    if (this.status !== STATUS.PENDING) {
      throw new Error('只有待审批状态的合同才能通过');
    }
    this.status = STATUS.ACTIVE;
    this.updatedAt = new Date();
    return { event: 'approved', id: this.id };
  }

  reject() {
    if (this.status !== STATUS.PENDING) {
      throw new Error('只有待审批状态的合同才能驳回');
    }
    this.status = STATUS.DRAFT;
    this.updatedAt = new Date();
    return { event: 'rejected', id: this.id };
  }

  start() {
    if (this.status !== STATUS.ACTIVE) {
      throw new Error('只有已生效的合同才能开始执行');
    }
    this.status = STATUS.EXEC;
    this.updatedAt = new Date();
    return { event: 'started', id: this.id };
  }

  finish() {
    if (this.status !== STATUS.EXEC) {
      throw new Error('只有执行中的合同才能完成');
    }
    this.status = STATUS.DONE;
    this.updatedAt = new Date();
    return { event: 'finished', id: this.id };
  }

  terminate(reason) {
    if (![STATUS.ACTIVE, STATUS.EXEC].includes(this.status)) {
      throw new Error('只有生效或执行中的合同才能终止');
    }
    if (!reason || reason.trim() === '') {
      throw new Error('终止原因不能为空');
    }
    this.status = STATUS.STOP;
    this.updatedAt = new Date();
    return { event: 'terminated', id: this.id, reason };
  }

  daysLeft() {
    if (!this.endDate) return 0;
    if ([STATUS.DONE, STATUS.STOP].includes(this.status)) return 0;
    const now = new Date();
    const left = this.endDate - now;
    return Math.max(0, Math.ceil(left / 86400000));
  }

  getPartnerName() {
    if (this.direction === DIRECTION.SALES) {
      return this.custName;
    }
    return this.supplierName;
  }

  getPartnerType() {
    return this.direction === DIRECTION.SALES ? '客户' : '供应商';
  }

  toJSON() {
    return {
      id: this.id,
      code: this.code,
      name: this.name,
      type: this.type,
      direction: this.direction,
      directionText: this.getDirectionText(),
      amount: this.amount,
      currency: this.currency,
      custId: this.custId,
      custName: this.custName,
      supplierId: this.supplierId,
      supplierName: this.supplierName,
      partnerName: this.getPartnerName(),
      partnerType: this.getPartnerType(),
      status: this.status,
      statusText: this.getStatusText(),
      signDate: this.signDate,
      startDate: this.startDate,
      endDate: this.endDate,
      content: this.content,
      plans: this.plans,
      attachments: this.attachments,
      daysLeft: this.daysLeft(),
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }

  toDatabase() {
    return {
      code: this.code,
      name: this.name,
      type: this.type,
      direction: this.direction,
      amount: this.amount,
      currency: this.currency,
      cust_id: this.direction === DIRECTION.SALES ? this.custId : null,
      cust_name: this.direction === DIRECTION.SALES ? this.custName : null,
      supplier_id: this.direction === DIRECTION.PURCHASE ? this.supplierId : null,
      supplier_name: this.direction === DIRECTION.PURCHASE ? this.supplierName : null,
      status: this.status,
      sign_date: this.signDate,
      start_date: this.startDate,
      end_date: this.endDate,
      content: this.content,
      created_by: this.createdBy
    };
  }

  getStatusText() {
    const statusMap = {
      [STATUS.DRAFT]: '草稿',
      [STATUS.PENDING]: '待批',
      [STATUS.ACTIVE]: '生效',
      [STATUS.EXEC]: '执行',
      [STATUS.DONE]: '完成',
      [STATUS.STOP]: '终止'
    };
    return statusMap[this.status] || '未知';
  }

  getDirectionText() {
    return this.direction === DIRECTION.SALES ? '销项合同' : '进项合同';
  }
}

module.exports = Contract;