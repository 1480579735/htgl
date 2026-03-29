const sql = require('mssql');
const config = require('./index');

class Database {
  constructor() {
    this.pool = null;
    this.connecting = false;
  }

  async connect() {
    if (this.pool) return this.pool;
    if (this.connecting) {
      await new Promise(resolve => setTimeout(resolve, 100));
      return this.connect();
    }
    
    this.connecting = true;
    try {
      const dbConfig = {
        server: config.db.server,
        database: config.db.database,
        options: {
          encrypt: false,
          trustServerCertificate: true,
          enableArithAbort: true
        }
      };
      
      // 如果使用 Windows 认证
      if (config.db.trustedConnection) {
        dbConfig.options.trustedConnection = true;
      } else {
        // SQL Server 认证
        dbConfig.user = config.db.user;
        dbConfig.password = config.db.password;
      }
      
      this.pool = await new sql.ConnectionPool(dbConfig).connect();
      this.connecting = false;
      console.log('Database connected successfully');
      return this.pool;
    } catch (err) {
      this.connecting = false;
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

  async begin() {
    const pool = await this.connect();
    const tx = new sql.Transaction(pool);
    await tx.begin();
    return tx;
  }

  async close() {
    if (this.pool) {
      await this.pool.close();
      this.pool = null;
    }
  }
}

module.exports = Database;