const Payment = require('./entity');
const eventBus = require('../../core/event');

class PaymentService {
  constructor(paymentRepo, contractRepo) {
    this.payments = paymentRepo;
    this.contracts = contractRepo;
  }

  async create(data) {
    const payment = new Payment(data);
    payment.validate();
    
    const id = await this.payments.create(payment);
    await eventBus.emit('payment.created', { id, contractId: data.contractId });
    
    return id;
  }

  async update(id, data, uid) {
    const row = await this.payments.find(id);
    if (!row) {
      throw new Error('付款计划不存在');
    }
    
    const payment = new Payment(row);
    if (payment.status !== 0) {
      throw new Error('只有待支付的款项才能修改');
    }
    
    Object.assign(payment, data);
    payment.validate();
    
    await this.payments.update(id, {
      stage: payment.stage,
      amount: payment.amount,
      dueDate: payment.dueDate,
      remark: payment.remark
    });
    
    await eventBus.emit('payment.updated', { id, uid });
    
    return true;
  }

  async pay(id, data, uid) {
    const row = await this.payments.find(id);
    if (!row) {
      throw new Error('付款计划不存在');
    }
    
    const payment = new Payment(row);
    payment.pay(data.actualDate, data.invoiceNo, data.remark);
    
    await this.payments.update(id, {
      status: payment.status,
      actualDate: payment.actualDate,
      invoiceNo: payment.invoiceNo,
      remark: payment.remark
    });
    
    await eventBus.emit('payment.paid', { id, contractId: payment.contractId, uid });
    
    // 检查合同是否所有付款都已完成
    await this._checkContractComplete(payment.contractId);
    
    return payment.toJSON();
  }

  async delete(id, uid) {
    const row = await this.payments.find(id);
    if (!row) {
      throw new Error('付款计划不存在');
    }
    
    const payment = new Payment(row);
    if (payment.status !== 0) {
      throw new Error('只有待支付的款项才能删除');
    }
    
    await this.payments.delete(id);
    await eventBus.emit('payment.deleted', { id, uid });
    
    return true;
  }

  async list(cond, page, size) {
    const result = await this.payments.list(cond, page, size);
    const list = result.list.map(row => new Payment(row).toJSON());
    return { ...result, list };
  }

  async listByContract(contractId) {
    const rows = await this.payments.listByContract(contractId);
    return rows.map(row => new Payment(row).toJSON());
  }

  async getOverdue() {
    const rows = await this.payments.getOverdue();
    return rows.map(row => new Payment(row).toJSON());
  }

  async _checkContractComplete(contractId) {
    const rows = await this.payments.listByContract(contractId);
    const allPaid = rows.every(row => row.status === 1);
    
    if (allPaid) {
      await this.contracts.update(contractId, { status: 4 }); // DONE
      await eventBus.emit('contract.completed', { contractId });
    }
  }
}

module.exports = PaymentService;