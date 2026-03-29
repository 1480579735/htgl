require('dotenv').config();

module.exports = {
  env: process.env.NODE_ENV || 'development',
  port: process.env.PORT || 3000,
  
  db: {
    server: process.env.DB_HOST || 'localhost',
    database: process.env.DB_DATABASE || 'ContractDB',
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    trustedConnection: process.env.DB_TRUSTED_CONNECTION === 'true',
    options: {
      encrypt: false,
      trustServerCertificate: true
    },
    pool: {
      max: 20,
      min: 5
    }
  },
  
  jwt: {
    secret: process.env.JWT_SECRET || 'your-secret-key',
    expiresIn: '24h'
  },
  
  upload: {
    dir: process.env.UPLOAD_DIR || './uploads',
    maxSize: 5 * 1024 * 1024
  },
  
  log: {
    level: process.env.LOG_LEVEL || 'info',
    dir: process.env.LOG_DIR || './logs'
  }
};