import Store from '../../core/store';
import api from './api';
import { checkPayment } from './valid';

class PaymentStore extends Store {
  constructor() {
    super({
      list: [],
      cur: null,
      filter: { type: null, status: null, contractId: null },
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
    
    this.addReducer('filter/update', (state, payload) => ({
      ...state,
      filter: { ...state.filter, ...payload },
      page: { ...state.page, cur: 1 }
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
    
    this.addEffect('payment/create', async (payload, _, dispatch) => {
      const valid = checkPayment(payload.data);
      if (!valid.ok) {
        throw new Error(valid.errors.join('；'));
      }
      await api.create(payload.data);
      await dispatch({ type: 'list/load' });
    });
    
    this.addEffect('payment/pay', async (payload, _, dispatch) => {
      await api.pay(payload.id, payload.data);
      await dispatch({ type: 'list/load' });
    });
    
    this.addEffect('payment/delete', async (payload, _, dispatch) => {
      await api.del(payload.id);
      await dispatch({ type: 'list/load' });
    });
  }

  async load() {
    await this.dispatch({ type: 'list/load' });
  }

  async create(data) {
    await this.dispatch({ type: 'payment/create', payload: { data } });
  }

  async pay(id, data) {
    await this.dispatch({ type: 'payment/pay', payload: { id, data } });
  }

  async delete(id) {
    await this.dispatch({ type: 'payment/delete', payload: { id } });
  }

  setFilter(filter) {
    this.dispatch({ type: 'filter/update', payload: filter });
    this.load();
  }

  setContract(contractId) {
    this.setFilter({ contractId });
  }
}

export default new PaymentStore();