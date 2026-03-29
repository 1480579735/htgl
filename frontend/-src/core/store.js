class Store {
  constructor(init = {}) {
    this.state = this._freeze(init);
    this.reducers = new Map();
    this.effects = new Map();
    this.listeners = [];
  }

  get() {
    return this.state;
  }

  addReducer(type, fn) {
    this.reducers.set(type, fn);
    return this;
  }

  addEffect(type, fn) {
    this.effects.set(type, fn);
    return this;
  }

  subscribe(fn) {
    this.listeners.push(fn);
    return () => {
      this.listeners = this.listeners.filter(l => l !== fn);
    };
  }

  async dispatch(action) {
    const { type, payload } = action;
    
    if (this.effects.has(type)) {
      try {
        await this.effects.get(type)(payload, this.state, this.dispatch.bind(this));
      } catch (err) {
        this._emit('error', { type, err });
        throw err;
      }
    }
    
    if (this.reducers.has(type)) {
      const next = this.reducers.get(type)(this.state, payload);
      if (next !== this.state) {
        this.state = this._freeze(next);
        this._notify({ type, payload });
      }
    }
  }

  _notify(change) {
    this.listeners.forEach(fn => fn(this.state, change));
  }

  _emit(name, data) {
    // 简单事件
  }

  _freeze(obj) {
    if (obj === null || typeof obj !== 'object') return obj;
    Object.freeze(obj);
    Object.values(obj).forEach(v => this._freeze(v));
    return obj;
  }
}

export default Store;