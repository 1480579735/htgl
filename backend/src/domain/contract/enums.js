const STATUS = {
  DRAFT: 0,
  PENDING: 1,
  ACTIVE: 2,
  EXEC: 3,
  DONE: 4,
  STOP: 5
};

const TYPE = {
  PURCHASE: 'purchase',
  SALES: 'sales',
  SERVICE: 'service',
  LEASE: 'lease'
};

const DIRECTION = {
  SALES: 1,    // 销项合同（销售给客户）
  PURCHASE: 2  // 进项合同（从供应商采购）
};

const STATUS_TEXT = {
  0: '草稿',
  1: '待批',
  2: '生效',
  3: '执行',
  4: '完成',
  5: '终止'
};

const TYPE_TEXT = {
  purchase: '采购',
  sales: '销售',
  service: '服务',
  lease: '租赁'
};

const DIRECTION_TEXT = {
  1: '销项合同',
  2: '进项合同'
};

module.exports = {
  STATUS,
  TYPE,
  DIRECTION,
  STATUS_TEXT,
  TYPE_TEXT,
  DIRECTION_TEXT
};