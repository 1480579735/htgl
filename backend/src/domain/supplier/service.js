const Supplier = require('./entity');
const { genCode } = require('../../utils/code');
const eventBus = require('../../core/event');

class SupplierService {
  constructor(supplierRepo, contractRepo) {
    this.suppliers = supplierRepo;
    this.contracts = contractRepo;
  }

  async create(data, uid) {
    const seq = await this.suppliers.getSeq();
    const code = await genCode('SUP', seq + 1);

    const supplier = new Supplier({
      code,
      name: data.name,
      contact: data.contact,
      phone: data.phone,
      email: data.email,
      address: data.address,
      bankName: data.bankName,
      bankAccount: data.bankAccount,
      taxNo: data.taxNo,
      rating: data.rating || 3
    });

    supplier.validate();

    const id = await this.suppliers.create(supplier);
    await eventBus.emit('supplier.created', { id, code, uid });

    return { id, code };
  }

  async update(id, data, uid) {
    const row = await this.suppliers.find(id);
    if (!row) {
      throw new Error('供应商不存在');
    }

    const supplier = new Supplier(row);
    Object.assign(supplier, data);
    supplier.validate();

    await this.suppliers.update(id, {
      name: supplier.name,
      contact: supplier.contact,
      phone: supplier.phone,
      email: supplier.email,
      address: supplier.address,
      bank_name: supplier.bankName,
      bank_account: supplier.bankAccount,
      tax_no: supplier.taxNo,
      rating: supplier.rating
    });

    await eventBus.emit('supplier.updated', { id, uid });

    return true;
  }

  async find(id) {
    const row = await this.suppliers.find(id);
    if (!row) return null;
    return row.toJSON();
  }

  async list(cond, page, size) {
    const result = await this.suppliers.list(cond, page, size);
    const list = result.list.map(supplier => supplier.toJSON());
    return { ...result, list };
  }

  async delete(id, uid) {
    const row = await this.suppliers.find(id);
    if (!row) {
      throw new Error('供应商不存在');
    }

    const contracts = await this.contracts.list({ cust_id: id }, 1, 1);
    if (contracts.list.length > 0) {
      throw new Error('该供应商存在关联合同，无法删除');
    }

    await this.suppliers.delete(id);
    await eventBus.emit('supplier.deleted', { id, uid });

    return true;
  }

  async updateStatus(id, status, uid) {
    const row = await this.suppliers.find(id);
    if (!row) {
      throw new Error('供应商不存在');
    }

    await this.suppliers.update(id, { status });
    await eventBus.emit('supplier.status.updated', { id, status, uid });

    return true;
  }

  async updateRating(id, rating, uid) {
    const row = await this.suppliers.find(id);
    if (!row) {
      throw new Error('供应商不存在');
    }

    await this.suppliers.update(id, { rating });
    await eventBus.emit('supplier.rating.updated', { id, rating, uid });

    return true;
  }

  async getTopSuppliers(limit = 10) {
    const suppliers = await this.suppliers.getTopSuppliers(limit);
    return suppliers.map(s => s.toJSON());
  }

  async getStats() {
    return await this.suppliers.getStats();
  }
}

module.exports = SupplierService;