const Contract = require('./entity');
const { STATUS, DIRECTION } = require('./enums');
const { genCode } = require('../../utils/code');
const eventBus = require('../../core/event');

class ContractService {
  constructor(contractRepo, customerRepo, supplierRepo, paymentRepo) {
    this.contracts = contractRepo;
    this.customers = customerRepo;
    this.suppliers = supplierRepo;
    this.payments = paymentRepo;
  }

  async create(data, uid) {
    const now = new Date();
    const seq = await this.contracts.getSeq(now.getFullYear(), now.getMonth() + 1);
    const code = await genCode('CT', seq + 1);

    let custId = null;
    let custName = '';
    let supplierId = null;
    let supplierName = '';

    if (data.direction === DIRECTION.SALES) {
      if (!data.custId) {
        throw new Error('销售合同必须选择客户');
      }
      const cust = await this.customers.find(data.custId);
      if (!cust) {
        throw new Error('客户不存在');
      }
      custId = data.custId;
      custName = cust.name;
    } else if (data.direction === DIRECTION.PURCHASE) {
      if (!data.supplierId) {
        throw new Error('采购合同必须选择供应商');
      }
      const supplier = await this.suppliers.find(data.supplierId);
      if (!supplier) {
        throw new Error('供应商不存在');
      }
      supplierId = data.supplierId;
      supplierName = supplier.name;
    }

    const contract = new Contract({
      code,
      name: data.name,
      type: data.type,
      direction: data.direction || DIRECTION.SALES,
      amount: data.amount,
      currency: data.currency || 'CNY',
      custId: custId,
      custName: custName,
      supplierId: supplierId,
      supplierName: supplierName,
      signDate: data.signDate,
      startDate: data.startDate,
      endDate: data.endDate,
      content: data.content,
      createdBy: uid
    });

    contract.validate();

    const id = await this.contracts.create(contract.toDatabase());

    if (data.plans && data.plans.length) {
      await this._createPlans(id, data.plans);
    }

    await eventBus.emit('contract.created', { id, code, uid });

    return { id, code };
  }

  async update(id, data, uid) {
    const row = await this.contracts.find(id);
    if (!row) {
      throw new Error('合同不存在');
    }
    
    const contract = new Contract(row);
    if (contract.status !== STATUS.DRAFT) {
      throw new Error('只有草稿状态的合同才能修改');
    }
    
    if (data.name !== undefined) contract.name = data.name;
    if (data.type !== undefined) contract.type = data.type;
    if (data.direction !== undefined) contract.direction = data.direction;
    if (data.amount !== undefined) contract.amount = data.amount;
    if (data.currency !== undefined) contract.currency = data.currency;
    if (data.signDate !== undefined) contract.signDate = data.signDate ? new Date(data.signDate) : null;
    if (data.startDate !== undefined) contract.startDate = data.startDate ? new Date(data.startDate) : null;
    if (data.endDate !== undefined) contract.endDate = data.endDate ? new Date(data.endDate) : null;
    if (data.content !== undefined) contract.content = data.content;
    
    if (data.direction !== undefined) {
      if (data.direction === DIRECTION.SALES && data.custId) {
        const cust = await this.customers.find(data.custId);
        if (cust) {
          contract.custId = data.custId;
          contract.custName = cust.name;
          contract.supplierId = null;
          contract.supplierName = '';
        }
      } else if (data.direction === DIRECTION.PURCHASE && data.supplierId) {
        const supplier = await this.suppliers.find(data.supplierId);
        if (supplier) {
          contract.supplierId = data.supplierId;
          contract.supplierName = supplier.name;
          contract.custId = null;
          contract.custName = '';
        }
      }
    } else {
      if (data.custId !== undefined && contract.direction === DIRECTION.SALES) {
        const cust = await this.customers.find(data.custId);
        if (cust) {
          contract.custId = data.custId;
          contract.custName = cust.name;
        }
      }
      if (data.supplierId !== undefined && contract.direction === DIRECTION.PURCHASE) {
        const supplier = await this.suppliers.find(data.supplierId);
        if (supplier) {
          contract.supplierId = data.supplierId;
          contract.supplierName = supplier.name;
        }
      }
    }
    
    contract.validate();
    
    await this.contracts.update(id, {
      name: contract.name,
      type: contract.type,
      direction: contract.direction,
      amount: contract.amount,
      currency: contract.currency,
      cust_id: contract.custId,
      cust_name: contract.custName,
      supplier_id: contract.supplierId,
      supplier_name: contract.supplierName,
      sign_date: contract.signDate,
      start_date: contract.startDate,
      end_date: contract.endDate,
      content: contract.content
    });
    
    await eventBus.emit('contract.updated', { id, uid });
    
    return true;
  }

  async find(id) {
    const row = await this.contracts.find(id);
    if (!row) return null;
    
    const contract = new Contract(row);
    const plans = await this.payments.listByContract(id);
    contract.plans = plans;
    
    return contract.toJSON();
  }

  async list(cond, page, size) {
    const result = await this.contracts.list(cond, page, size);
    const list = result.list.map(row => new Contract(row).toJSON());
    return { ...result, list };
  }

  async submit(id, uid) {
    const row = await this.contracts.find(id);
    if (!row) {
      throw new Error('合同不存在');
    }
    
    const contract = new Contract(row);
    const evt = contract.submit();
    
    await this.contracts.update(id, { status: contract.status });
    await eventBus.emit('contract.submitted', { ...evt, uid });
    
    return contract.toJSON();
  }

  async approve(id, uid, remark = '') {
    const row = await this.contracts.find(id);
    if (!row) {
      throw new Error('合同不存在');
    }
    
    const contract = new Contract(row);
    const evt = contract.approve();
    
    await this.contracts.update(id, { status: contract.status });
    await eventBus.emit('contract.approved', { ...evt, uid, remark });
    
    return contract.toJSON();
  }

  async reject(id, uid, reason = '') {
    const row = await this.contracts.find(id);
    if (!row) {
      throw new Error('合同不存在');
    }
    
    const contract = new Contract(row);
    const evt = contract.reject();
    
    await this.contracts.update(id, { status: contract.status });
    await eventBus.emit('contract.rejected', { ...evt, uid, reason });
    
    return contract.toJSON();
  }

  async start(id, uid) {
    const row = await this.contracts.find(id);
    if (!row) {
      throw new Error('合同不存在');
    }
    
    const contract = new Contract(row);
    const evt = contract.start();
    
    await this.contracts.update(id, { status: contract.status });
    await eventBus.emit('contract.started', { ...evt, uid });
    
    return contract.toJSON();
  }

  async finish(id, uid) {
    const row = await this.contracts.find(id);
    if (!row) {
      throw new Error('合同不存在');
    }
    
    const contract = new Contract(row);
    const evt = contract.finish();
    
    await this.contracts.update(id, { status: contract.status });
    await eventBus.emit('contract.finished', { ...evt, uid });
    
    return contract.toJSON();
  }

  async terminate(id, uid, reason) {
    const row = await this.contracts.find(id);
    if (!row) {
      throw new Error('合同不存在');
    }
    
    const contract = new Contract(row);
    const evt = contract.terminate(reason);
    
    await this.contracts.update(id, { status: contract.status });
    await eventBus.emit('contract.terminated', { ...evt, uid });
    
    return contract.toJSON();
  }

  async delete(id, uid) {
    const row = await this.contracts.find(id);
    if (!row) {
      throw new Error('合同不存在');
    }
    
    const contract = new Contract(row);
    if (contract.status !== STATUS.DRAFT) {
      throw new Error('只有草稿状态的合同才能删除');
    }
    
    await this.contracts.delete(id);
    await eventBus.emit('contract.deleted', { id, uid });
    
    return true;
  }

  async getExpiring(days = 30) {
    const result = await this.contracts.list({}, 1, 1000);
    return result.list.filter(c => {
      const contract = new Contract(c);
      const left = contract.daysLeft();
      return left > 0 && left <= days;
    });
  }

  async getStats() {
    // 直接调用 repo 的 getStats，不做任何修改
    return await this.contracts.getStats();
  }

  async getByDirection(direction, page, size) {
    const result = await this.contracts.list({ direction }, page, size);
    const list = result.list.map(row => new Contract(row).toJSON());
    return { ...result, list };
  }

  async _createPlans(contractId, plans) {
    let total = 0;
    for (const p of plans) {
      total += p.amount;
      await this.payments.create({
        contractId,
        stage: p.stage,
        amount: p.amount,
        dueDate: p.dueDate,
        type: p.type || 'payment',
        status: 0
      });
    }
    
    const contract = await this.contracts.find(contractId);
    if (Math.abs(total - contract.amount) > 0.01) {
      throw new Error('付款计划总金额与合同金额不符');
    }
    
    return true;
  }
}

module.exports = ContractService;