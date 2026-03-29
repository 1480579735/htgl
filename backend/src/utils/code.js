async function genCode(prefix, seq) {
  const year = new Date().getFullYear();
  const month = String(new Date().getMonth() + 1).padStart(2, '0');
  const num = String(seq).padStart(6, '0');
  return `${prefix}${year}${month}${num}`;
}

module.exports = { genCode };