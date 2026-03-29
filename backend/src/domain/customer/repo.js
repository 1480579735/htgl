const BaseRepo = require('../../core/repo');
const Customer = require('./entity');

class CustomerRepo extends BaseRepo {
  constructor(db) {
    super(db, 'customers');
  }

  async find(id) {
    const sql = `SELECT * FROM customers WHERE id = @id AND del = 0`;
    const rows = await this.db.query(sql, { id });
    return rows[0] ? new Customer(rows[0]) : null;
  }

  async findByCode(code) {
    const sql = `SELECT * FROM customers WHERE code = @code AND del = 0`;
    const rows = await this.db.query(sql, { code });
    return rows[0] ? new Customer(rows[0]) : null;
  }

  async getSeq() {
    const sql = `SELECT COUNT(*) as cnt FROM customers WHERE del = 0`;
    const rows = await this.db.query(sql);
    return rows[0].cnt;
  }

  async list(cond = {}, page = 1, size = 20) {
    const result = await super.list(cond, page, size);
    result.list = result.list.map(row => new Customer(row));
    return result;
  }

  async create(customer) {
    return super.create(customer.toDatabase());
  }

  async update(id, data) {
    return super.update(id, data);
  }

  async listByRisk(risk, page = 1, size = 20) {
    return this.list({ risk }, page, size);
  }
}

module.exports = CustomerRepo;