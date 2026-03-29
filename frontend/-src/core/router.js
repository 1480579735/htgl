class Router {
  constructor(routes) {
    this.routes = routes;
    this.current = null;
    this.listeners = [];
    
    window.addEventListener('popstate', () => {
      this._handleRoute();
    });
  }

  push(path, state = {}) {
    window.history.pushState(state, '', path);
    this._handleRoute();
  }

  replace(path, state = {}) {
    window.history.replaceState(state, '', path);
    this._handleRoute();
  }

  back() {
    window.history.back();
  }

  _handleRoute() {
    const path = window.location.pathname;
    let matched = null;
    let params = {};
    
    for (const route of this.routes) {
      const pattern = route.path.replace(/:([^/]+)/g, '([^/]+)');
      const regex = new RegExp(`^${pattern}$`);
      const match = path.match(regex);
      
      if (match) {
        matched = route;
        const keys = (route.path.match(/:([^/]+)/g) || []).map(k => k.slice(1));
        keys.forEach((key, i) => {
          params[key] = match[i + 1];
        });
        break;
      }
    }
    
    this.current = { route: matched, params };
    this._notify(this.current);
  }

  subscribe(fn) {
    this.listeners.push(fn);
    return () => {
      this.listeners = this.listeners.filter(l => l !== fn);
    };
  }

  _notify(route) {
    this.listeners.forEach(fn => fn(route));
  }
}

export default Router;