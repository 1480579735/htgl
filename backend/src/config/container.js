const Database = require('../core/db');
const Cache = require('../core/cache');
const EventBus = require('../core/event');

// Repositories
const ContractRepo = require('../domain/contract/repo');
const CustomerRepo = require('../domain/customer/repo');
const SupplierRepo = require('../domain/supplier/repo');
const PaymentRepo = require('../domain/payment/repo');
const UserRepo = require('../domain/user/repo');

// Services
const ContractService = require('../domain/contract/service');
const CustomerService = require('../domain/customer/service');
const SupplierService = require('../domain/supplier/service');
const PaymentService = require('../domain/payment/service');

class Container {
  constructor() {
    this.instances = new Map();
  }

  register(name, factory) {
    this.instances.set(name, { factory, instance: null });
  }

  get(name) {
    const item = this.instances.get(name);
    if (!item) {
      throw new Error(`Service ${name} not found`);
    }
    if (!item.instance) {
      item.instance = item.factory(this);
    }
    return item.instance;
  }
}

const container = new Container();

// 注册数据库
container.register('db', () => {
  const db = new Database();
  db.connect().catch(err => console.error('DB connection error:', err));
  return db;
});

// 注册其他组件
container.register('cache', () => new Cache());
container.register('eventBus', () => EventBus);

// 注册 Repositories
container.register('contractRepo', (c) => new ContractRepo(c.get('db')));
container.register('customerRepo', (c) => new CustomerRepo(c.get('db')));
container.register('supplierRepo', (c) => new SupplierRepo(c.get('db')));
container.register('paymentRepo', (c) => new PaymentRepo(c.get('db')));
container.register('userRepo', (c) => new UserRepo(c.get('db')));

// 注册 Services
container.register('contractService', (c) => new ContractService(
  c.get('contractRepo'),
  c.get('customerRepo'),
  c.get('paymentRepo')
));
container.register('customerService', (c) => new CustomerService(
  c.get('customerRepo'),
  c.get('contractRepo')
));
container.register('supplierService', (c) => new SupplierService(
  c.get('supplierRepo'),
  c.get('contractRepo')
));
container.register('paymentService', (c) => new PaymentService(
  c.get('paymentRepo'),
  c.get('contractRepo')
));

module.exports = container;