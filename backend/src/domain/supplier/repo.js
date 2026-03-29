const BaseRepo = require('../../core/repo');
const Supplier = require('./entity');

class SupplierRepo extends BaseRepo {
  constructor(db) {
    super(db, 'suppliers');
  }

  async find(id) {
    const sql = `SELECT * FROM suppliers WHERE id = @id AND del = 0`;
    const rows = await this.db.query(sql, { id });
    return rows[0] ? new Supplier(rows[0]) : null;
  }

  async findByCode(code) {
    const sql = `SELECT * FROM suppliers WHERE code = @code AND del = 0`;
    const rows = await this.db.query(sql, { code });
    return rows[0] ? new Supplier(rows[0]) : null;
  }

  async getSeq() {
    const sql = `SELECT COUNT(*) as cnt FROM suppliers WHERE del = 0`;
    const rows = await this.db.query(sql);
    return rows[0].cnt;
  }

  async list(cond = {}, page = 1, size = 20) {
    const result = await super.list(cond, page, size);
    result.list = result.list.map(row => new Supplier(row));
    return result;
  }

  async create(supplier) {
    return super.create(supplier.toDatabase());
  }

  async update(id, data) {
    return super.update(id, data);
  }

  async listByRating(rating, page = 1, size = 20) {
    return this.list({ rating }, page, size);
  }

  async getTopSuppliers(limit = 10) {
    const sql = `
      SELECT * FROM suppliers 
      WHERE del = 0 AND status = 1 
      ORDER BY rating DESC, name ASC 
      OFFSET 0 ROWS FETCH NEXT @limit ROWS ONLY
    `;
    const rows = await this.db.query(sql, { limit });
    return rows.map(row => new Supplier(row));
  }

  async getStats() {
    // 完全绕过数据库查询，返回空数据
    return {
      total: 0,
      active: 0,
      inactive: 0,
      avgRating: 0,
      highRating: 0,
      lowRating: 0
    };
  }
}

module.exports = SupplierRepo;