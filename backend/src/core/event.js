class EventBus {
  constructor() {
    this.listeners = new Map();
  }

  on(event, handler) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(handler);
    return () => this.off(event, handler);
  }

  off(event, handler) {
    if (!this.listeners.has(event)) return;
    const handlers = this.listeners.get(event);
    const idx = handlers.indexOf(handler);
    if (idx > -1) handlers.splice(idx, 1);
  }

  async emit(event, data) {
    if (!this.listeners.has(event)) return;
    const handlers = this.listeners.get(event);
    for (const handler of handlers) {
      try {
        await handler(data);
      } catch (err) {
        console.error(`Event handler error for ${event}:`, err);
      }
    }
  }

  once(event, handler) {
    const wrapper = async (data) => {
      await handler(data);
      this.off(event, wrapper);
    };
    this.on(event, wrapper);
  }

  clear() {
    this.listeners.clear();
  }
}

module.exports = new EventBus();