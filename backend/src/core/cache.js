class Cache {
  constructor(ttl = 300000) {
    this.store = new Map();
    this.ttl = ttl;
  }

  get(key) {
    const item = this.store.get(key);
    if (!item) return null;
    if (Date.now() > item.expire) {
      this.store.delete(key);
      return null;
    }
    return item.value;
  }

  set(key, value, ttl = this.ttl) {
    this.store.set(key, {
      value,
      expire: Date.now() + ttl
    });
  }

  del(key) {
    this.store.delete(key);
  }

  clear() {
    this.store.clear();
  }

  has(key) {
    return this.get(key) !== null;
  }
}

module.exports = Cache;