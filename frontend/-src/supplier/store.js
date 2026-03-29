import Store from '../../core/store';
import api from './api';

class SupplierStore extends Store {
  constructor() {
    super({
      list: [],
      cur: null,
      filter: { rating: null, status: null, kw: '' },
      page: { cur: 1, size: 20, total: 0, pages: 0 },
      loading: false,
      err: null,
      stats: null,
      topList: []
    });
    
    this.api = api;
    this._setup();
  }

  _setup() {
    this.addReducer('list/start', (state) => ({
      ...state,
      loading: true,
      err: null
    }));
    
    this.addReducer('list/success', (state, payload) => ({
      ...state,
      list: payload.list,
      page: {
        ...state.page,
        total: payload.total,
        pages: payload.pages
      },
      loading: false
    }));
    
    this.addReducer('list/fail', (state, payload) => ({
      ...state,
      loading: false,
      err: payload.msg
    }));
    
    this.addReducer('detail/success', (state, payload) => ({
      ...state,
      cur: payload.data,
      loading: false
    }));
    
    this.addReducer('filter/update', (state, payload) => ({
      ...state,
      filter: { ...state.filter, ...payload },
      page: { ...state.page, cur: 1 }
    }));
    
    this.addReducer('page/set', (state, payload) => ({
      ...state,
      page: { ...state.page, cur: payload }
    }));
    
    this.addReducer('stats/success', (state, payload) => ({
      ...state,
      stats: payload.stats
    }));
    
    this.addReducer('top/success', (state, payload) => ({
      ...state,
      topList: payload.list
    }));
    
    this.addEffect('list/load', async (_, state, dispatch) => {
      await dispatch({ type: 'list/start' });
      try {
        const params = {
          page: state.page.cur,
          size: state.page.size,
          ...state.filter
        };
        const res = await api.list(params);
        await dispatch({
          type: 'list/success',
          payload: {
            list: res.list,
            total: res.total,
            pages: res.pages
          }
        });
      } catch (err) {
        await dispatch({ type: 'list/fail', payload: { msg: err.message } });
      }
    });
    
    this.addEffect('detail/load', async (payload, _, dispatch) => {
      await dispatch({ type: 'list/start' });
      try {
        const data = await api.get(payload.id);
        await dispatch({ type: 'detail/success', payload: { data } });
      } catch (err) {
        await dispatch({ type: 'list/fail', payload: { msg: err.message } });
      }
    });
    
    this.addEffect('supplier/create', async (payload, _, dispatch) => {
      await api.create(payload.data);
      await dispatch({ type: 'list/load' });
    });
    
    this.addEffect('supplier/update', async (payload, _, dispatch) => {
      await api.update(payload.id, payload.data);
      await dispatch({ type: 'list/load' });
    });
    
    this.addEffect('supplier/status', async (payload, _, dispatch) => {
      await api.updateStatus(payload.id, payload.status);
      await dispatch({ type: 'list/load' });
    });
    
    this.addEffect('supplier/rating', async (payload, _, dispatch) => {
      await api.updateRating(payload.id, payload.rating);
      await dispatch({ type: 'list/load' });
    });
    
    this.addEffect('supplier/delete', async (payload, _, dispatch) => {
      await api.del(payload.id);
      await dispatch({ type: 'list/load' });
    });
    
    this.addEffect('stats/load', async (_, state, dispatch) => {
      try {
        const stats = await api.getStats();
        await dispatch({ type: 'stats/success', payload: { stats } });
      } catch (err) {
        console.error('加载统计失败:', err);
      }
    });
    
    this.addEffect('top/load', async (payload, _, dispatch) => {
      try {
        const list = await api.getTop(payload.limit);
        await dispatch({ type: 'top/success', payload: { list } });
      } catch (err) {
        console.error('加载TOP供应商失败:', err);
      }
    });
  }

  async load() {
    await this.dispatch({ type: 'list/load' });
  }

  async loadDetail(id) {
    await this.dispatch({ type: 'detail/load', payload: { id } });
  }

  async create(data) {
    await this.dispatch({ type: 'supplier/create', payload: { data } });
  }

  async update(id, data) {
    await this.dispatch({ type: 'supplier/update', payload: { id, data } });
  }

  async updateStatus(id, status) {
    await this.dispatch({ type: 'supplier/status', payload: { id, status } });
  }

  async updateRating(id, rating) {
    await this.dispatch({ type: 'supplier/rating', payload: { id, rating } });
  }

  async delete(id) {
    await this.dispatch({ type: 'supplier/delete', payload: { id } });
  }

  async loadStats() {
    await this.dispatch({ type: 'stats/load' });
  }

  async loadTop(limit = 10) {
    await this.dispatch({ type: 'top/load', payload: { limit } });
  }

  setFilter(filter) {
    this.dispatch({ type: 'filter/update', payload: filter });
    this.load();
  }

  setPage(page) {
    this.dispatch({ type: 'page/set', payload: page });
    this.load();
  }
}

export default new SupplierStore();