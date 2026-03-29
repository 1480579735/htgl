import Store from '../../core/store';
import api from './api';
import { checkCustomer } from './valid';

class CustomerStore extends Store {
  constructor() {
    super({
      list: [],
      cur: null,
      filter: { risk: null, kw: '' },
      page: { cur: 1, size: 20, total: 0, pages: 0 },
      loading: false,
      err: null
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
    
    this.addEffect('customer/create', async (payload, _, dispatch) => {
      const valid = checkCustomer(payload.data);
      if (!valid.ok) {
        throw new Error(valid.errors.join('；'));
      }
      await api.create(payload.data);
      await dispatch({ type: 'list/load' });
    });
    
    this.addEffect('customer/update', async (payload, _, dispatch) => {
      await api.update(payload.id, payload.data);
      await dispatch({ type: 'list/load' });
    });
    
    this.addEffect('customer/risk', async (payload, _, dispatch) => {
      await api.updateRisk(payload.id, payload.risk);
      await dispatch({ type: 'list/load' });
    });
    
    this.addEffect('customer/delete', async (payload, _, dispatch) => {
      await api.del(payload.id);
      await dispatch({ type: 'list/load' });
    });
  }

  async load() {
    await this.dispatch({ type: 'list/load' });
  }

  async loadDetail(id) {
    await this.dispatch({ type: 'detail/load', payload: { id } });
  }

  async create(data) {
    await this.dispatch({ type: 'customer/create', payload: { data } });
  }

  async update(id, data) {
    await this.dispatch({ type: 'customer/update', payload: { id, data } });
  }

  async updateRisk(id, risk) {
    await this.dispatch({ type: 'customer/risk', payload: { id, risk } });
  }

  async delete(id) {
    await this.dispatch({ type: 'customer/delete', payload: { id } });
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

export default new CustomerStore();