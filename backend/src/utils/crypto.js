const crypto = require('crypto');

function md5(str) {
  return crypto.createHash('md5').update(str).digest('hex');
}

function sha256(str) {
  return crypto.createHash('sha256').update(str).digest('hex');
}

function randomStr(len = 32) {
  return crypto.randomBytes(len).toString('hex').slice(0, len);
}

module.exports = { md5, sha256, randomStr };