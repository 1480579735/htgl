const BaseRepo = require('../../core/repo');
const Payment = require('./entity');

class PaymentRepo extends BaseRepo {
  constructor(db) {
    super(db, 'payments');
  }

  async find(id) {
    const sql = `SELECT * FROM payments WHERE id = @id`;
    const rows = await this.db.query(sql, { id });
    return rows[0] ? new Payment(rows[0]) : null;
  }

  async listByContract(contractId) {
    const sql = `
      SELECT * FROM payments 
      WHERE contract_id = @contractId 
      ORDER BY due_date ASC
    `;
    const rows = await this.db.query(sql, { contractId });
    return rows.map(row => new Payment(row));
  }

  async getOverdue() {
    const sql = `
      SELECT p.*, c.code as contract_code, c.name as contract_name, c.cust_name as customer_name
      FROM payments p
      LEFT JOIN contracts c ON p.contract_id = c.id
      WHERE p.status = 0 AND p.due_date < GETDATE() AND c.del = 0
      ORDER BY p.due_date ASC
    `;
    const rows = await this.db.query(sql);
    return rows.map(row => new Payment(row));
  }

  async getStats(contractId) {
    const sql = `
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 0 THEN 1 ELSE 0 END) as pending,
        SUM(CASE WHEN status = 1 THEN 1 ELSE 0 END) as paid,
        SUM(CASE WHEN status = 0 AND due_date < GETDATE() THEN 1 ELSE 0 END) as overdue,
        SUM(CASE WHEN status = 0 THEN amount ELSE 0 END) as pendingAmount,
        SUM(CASE WHEN status = 1 THEN amount ELSE 0 END) as paidAmount
      FROM payments 
      WHERE contract_id = @contractId
    `;
    const rows = await this.db.query(sql, { contractId });
    return rows[0];
  }

  async create(payment) {
    return super.create(payment.toDatabase());
  }
}

module.exports = PaymentRepo;