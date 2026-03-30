const sql = require('mssql');

const config = {
  user: process.env.DB_USER || 'sa',
  password: process.env.DB_PASSWORD || '123456',
  server: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'ContractDB',
  options: {
    encrypt: false,
    trustServerCertificate: true
  }
};

class Database {
  constructor() {
    this.pool = null;
  }

  async connect() {
    if (this.pool) return this.pool;
    try {
      this.pool = await new sql.ConnectionPool(config).connect();
      console.log('Database connected');
      return this.pool;
    } catch (err) {
      console.error('Database connection failed:', err);
      throw err;
    }
  }

  async query(sqlStr, params = {}) {
    const pool = await this.connect();
    const req = pool.request();
    for (const [key, val] of Object.entries(params)) {
      req.input(key, val);
    }
    const result = await req.query(sqlStr);
    return result.recordset;
  }

  async execute(sqlStr, params = {}) {
    const pool = await this.connect();
    const req = pool.request();
    for (const [key, val] of Object.entries(params)) {
      req.input(key, val);
    }
    const result = await req.query(sqlStr);
    return result.rowsAffected[0];
  }
}

module.exports = new Database();