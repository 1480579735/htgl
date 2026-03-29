const BaseRepo = require('../../core/repo');
const User = require('./entity');

class UserRepo extends BaseRepo {
  constructor(db) {
    super(db, 'users');
  }

  async find(id) {
    const sql = `SELECT * FROM users WHERE id = @id AND del = 0`;
    const rows = await this.db.query(sql, { id });
    return rows[0] ? new User(rows[0]) : null;
  }

  async findByName(name) {
    const sql = `SELECT * FROM users WHERE name = @name AND del = 0`;
    const rows = await this.db.query(sql, { name });
    return rows[0] ? new User(rows[0]) : null;
  }

  async findByRole(role) {
    const sql = `SELECT * FROM users WHERE role = @role AND status = 1 AND del = 0`;
    const rows = await this.db.query(sql, { role });
    return rows.map(row => new User(row));
  }

  async updatePwd(id, pwd) {
    return this.update(id, { pwd });
  }
}

module.exports = UserRepo;