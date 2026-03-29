const bcrypt = require('bcryptjs');
const db = require('../core/db');
const { logger } = require('../utils/log');

async function initDatabase() {
  try {
    // 检查是否需要初始化
    const users = await db.query("SELECT COUNT(*) as cnt FROM users");
    if (users[0].cnt > 0) {
      logger.info('Database already initialized');
      return;
    }
    
    logger.info('Initializing database...');
    
    // 创建默认管理员
    const hashedPwd = await bcrypt.hash(process.env.ADMIN_PASSWORD || 'admin123', 10);
    await db.execute(`
      INSERT INTO users (name, pwd, real_name, role, status) 
      VALUES (@name, @pwd, @realName, @role, 1)
    `, {
      name: process.env.ADMIN_NAME || 'admin',
      pwd: hashedPwd,
      realName: '系统管理员',
      role: 'admin'
    });
    
    logger.info('Database initialized successfully');
  } catch (err) {
    logger.error('Failed to initialize database:', err);
  }
}

module.exports = { initDatabase };