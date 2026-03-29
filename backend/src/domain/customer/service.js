const Customer = require('./entity');
const { genCode } = require('../../utils/code');
const eventBus = require('../../core/event');

class CustomerService {
  constructor(customerRepo, contractRepo) {
    this.customers = customerRepo;
    this.contracts = contractRepo;
  }

  async create(data, uid) {
    const seq = await this.customers.getSeq();
    const code = await genCode('CUST', seq + 1);

    const customer = new Customer({
      code,
      name: data.name,
      contact: data.contact,
      phone: data.phone,
      email: data.email,
      address: data.address
    });

    customer.validate();

    const id = await this.customers.create(customer);
    await eventBus.emit('customer.created', { id, code, uid });

    return { id, code };
  }

  async update(id, data, uid) {
    const row = await this.customers.find(id);
    if (!row) {
      throw new Error('客户不存在');
    }

    const customer = new Customer(row);
    Object.assign(customer, data);
    customer.validate();

    await this.customers.update(id, {
      name: customer.name,
      contact: customer.contact,
      phone: customer.phone,
      email: customer.email,
      address: customer.address
    });

    await eventBus.emit('customer.updated', { id, uid });

    return true;
  }

  async find(id) {
    const row = await this.customers.find(id);
    if (!row) return null;
    return new Customer(row).toJSON();
  }

  async list(cond, page, size) {
    const result = await this.customers.list(cond, page, size);
    const list = result.list.map(row => new Customer(row).toJSON());
    return { ...result, list };
  }

  async delete(id, uid) {
    const row = await this.customers.find(id);
    if (!row) {
      throw new Error('客户不存在');
    }

    const contracts = await this.contracts.listByCust(id, 1, 1);
    if (contracts.list.length > 0) {
      throw new Error('该客户存在关联合同，无法删除');
    }

    await this.customers.delete(id);
    await eventBus.emit('customer.deleted', { id, uid });

    return true;
  }

  async updateRisk(id, risk, uid) {
    const row = await this.customers.find(id);
    if (!row) {
      throw new Error('客户不存在');
    }

    await this.customers.update(id, { risk });
    await eventBus.emit('customer.risk.updated', { id, risk, uid });

    return true;
  }
}

module.exports = CustomerService;