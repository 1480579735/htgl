export const STATUS = {
  DRAFT: 0,
  PENDING: 1,
  ACTIVE: 2,
  EXEC: 3,
  DONE: 4,
  STOP: 5
};

export const TYPE = {
  PURCHASE: 'purchase',
  SALES: 'sales',
  SERVICE: 'service',
  LEASE: 'lease'
};

export const STATUS_TEXT = {
  0: '草稿',
  1: '待批',
  2: '生效',
  3: '执行',
  4: '完成',
  5: '终止'
};

export const TYPE_TEXT = {
  purchase: '采购',
  sales: '销售',
  service: '服务',
  lease: '租赁'
};