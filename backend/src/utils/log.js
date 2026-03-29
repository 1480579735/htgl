const winston = require('winston');
const path = require('path');
const config = require('../config');

const logger = winston.createLogger({
  level: config.log.level,
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({
      filename: path.join(config.log.dir, 'error.log'),
      level: 'error',
      maxsize: 10 * 1024 * 1024,
      maxFiles: 10
    }),
    new winston.transports.File({
      filename: path.join(config.log.dir, 'combined.log'),
      maxsize: 10 * 1024 * 1024,
      maxFiles: 10
    })
  ]
});

if (config.env !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple()
  }));
}

module.exports = { logger };