class BaseRepo {
  constructor(db, table) {
    this.db = db;
    this.table = table;
  }

  async find(id) {
    const sql = `SELECT * FROM ${this.table} WHERE id = @id AND del = 0`;
    const rows = await this.db.query(sql, { id });
    return rows[0] || null;
  }

  async findBy(cond) {
    const keys = Object.keys(cond);
    const where = keys.map((k, i) => `${k} = @p${i}`).join(' AND ');
    const params = {};
    keys.forEach((k, i) => { params[`p${i}`] = cond[k]; });
    
    const sql = `SELECT * FROM ${this.table} WHERE ${where} AND del = 0`;
    const rows = await this.db.query(sql, params);
    return rows[0] || null;
  }

  async list(cond = {}, page = 1, size = 20) {
    const where = [];
    const params = {};
    let idx = 0;
    
    for (const [key, val] of Object.entries(cond)) {
      if (val !== undefined && val !== null && val !== '') {
        if (typeof val === 'object' && val.$like) {
          where.push(`${key} LIKE @p${idx}`);
          params[`p${idx}`] = val.$like;
          idx++;
        } else if (Array.isArray(val)) {
          const placeholders = val.map((_, i) => `@p${idx + i}`).join(',');
          where.push(`${key} IN (${placeholders})`);
          val.forEach((v, i) => {
            params[`p${idx + i}`] = v;
          });
          idx += val.length;
        } else {
          where.push(`${key} = @p${idx}`);
          params[`p${idx}`] = val;
          idx++;
        }
      }
    }
    
    const whereSql = where.length > 0 ? `WHERE ${where.join(' AND ')} AND del = 0` : 'WHERE del = 0';
    const offset = (page - 1) * size;
    
    const countSql = `SELECT COUNT(*) as total FROM ${this.table} ${whereSql}`;
    const countRes = await this.db.query(countSql, params);
    const total = countRes[0].total;
    
    const dataSql = `
      SELECT * FROM ${this.table} 
      ${whereSql}
      ORDER BY created_at DESC 
      OFFSET @offset ROWS 
      FETCH NEXT @size ROWS ONLY
    `;
    const data = await this.db.query(dataSql, { ...params, offset, size });
    
    return {
      list: data,
      total,
      page,
      size,
      pages: Math.ceil(total / size)
    };
  }

  async create(data) {
    const keys = Object.keys(data);
    const cols = keys.join(',');
    const vals = keys.map(k => `@${k}`).join(',');
    
    const sql = `
      INSERT INTO ${this.table} (${cols}, created_at, updated_at) 
      VALUES (${vals}, GETDATE(), GETDATE());
      SELECT SCOPE_IDENTITY() as id;
    `;
    
    const res = await this.db.query(sql, data);
    return res[0].id;
  }

  async update(id, data) {
    const sets = [];
    const params = { id };
    
    for (const [key, val] of Object.entries(data)) {
      if (val !== undefined) {
        sets.push(`${key} = @${key}`);
        params[key] = val;
      }
    }
    
    if (sets.length === 0) return 0;
    
    const sql = `
      UPDATE ${this.table} 
      SET ${sets.join(',')}, updated_at = GETDATE()
      WHERE id = @id AND del = 0
    `;
    
    return await this.db.execute(sql, params);
  }

  async delete(id) {
    const sql = `UPDATE ${this.table} SET del = 1, deleted_at = GETDATE() WHERE id = @id`;
    return await this.db.execute(sql, { id });
  }

  async count(cond = {}) {
    const where = [];
    const params = {};
    let idx = 0;
    
    for (const [key, val] of Object.entries(cond)) {
      if (val !== undefined && val !== null) {
        where.push(`${key} = @p${idx}`);
        params[`p${idx}`] = val;
        idx++;
      }
    }
    
    const whereSql = where.length > 0 ? 'WHERE ' + where.join(' AND ') : '';
    const sql = `SELECT COUNT(*) as total FROM ${this.table} ${whereSql} AND del = 0`;
    const res = await this.db.query(sql, params);
    return res[0].total;
  }
}

module.exports = BaseRepo;