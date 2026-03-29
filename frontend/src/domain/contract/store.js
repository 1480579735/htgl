import Store from '../../core/store';
import api from './api';

class ContractStore extends Store {
  constructor() {
    super({
      list: [],
      cur: null,
      filter: { status: null, type: null, direction: null, kw: '' },
      page: { cur: 1, size: 20, total: 0, pages: 0 },
      loading: false,
      err: null
    });
    
    this.api = api;
    this._setup();
  }

  _setup() {
    this.addReducer('list/start', (state) => ({ ...state, loading: true, err: null }));
    
    this.addReducer('list/success', (state, payload) => ({
      ...state,
      list: payload.list,
      page: { ...state.page, total: payload.total, pages: payload.pages },
      loading: false
    }));
    
    this.addReducer('list/fail', (state, payload) => ({ ...state, loading: false, err: payload.msg }));
    this.addReducer('detail/success', (state, payload) => ({ ...state, cur: payload.data, loading: false }));
    this.addReducer('filter/update', (state, payload) => ({ ...state, filter: { ...state.filter, ...payload }, page: { ...state.page, cur: 1 } }));
    this.addReducer('page/set', (state, payload) => ({ ...state, page: { ...state.page, cur: payload } }));
    
    this.addEffect('list/load', async (_, state, dispatch) => {
      await dispatch({ type: 'list/start' });
      try {
        const params = { page: state.page.cur, size: state.page.size, ...state.filter };
        if (!params.status) delete params.status;
        if (!params.type) delete params.type;
        if (!params.direction) delete params.direction;
        if (!params.kw) delete params.kw;
        
        const res = await this.api.list(params);
        await dispatch({ type: 'list/success', payload: { list: res.list || [], total: res.total || 0, pages: res.pages || 0 } });
      } catch (err) {
        await dispatch({ type: 'list/fail', payload: { msg: err.message } });
      }
    });
    
    this.addEffect('detail/load', async (payload, _, dispatch) => {
      await dispatch({ type: 'list/start' });
      try {
        const data = await this.api.get(payload.id);
        await dispatch({ type: 'detail/success', payload: { data } });
      } catch (err) {
        await dispatch({ type: 'list/fail', payload: { msg: err.message } });
      }
    });
    
    this.addEffect('contract/create', async (payload, _, dispatch) => {
      await this.api.create(payload.data);
      await dispatch({ type: 'list/load' });
    });
    
    this.addEffect('contract/update', async (payload, _, dispatch) => {
      await this.api.update(payload.id, payload.data);
      await dispatch({ type: 'list/load' });
    });
    
    this.addEffect('contract/submit', async (payload, _, dispatch) => {
      await this.api.submit(payload.id);
      await dispatch({ type: 'list/load' });
    });
    
    this.addEffect('contract/approve', async (payload, _, dispatch) => {
      await this.api.approve(payload.id, payload.result, payload.remark);
      await dispatch({ type: 'list/load' });
    });
    
    this.addEffect('contract/start', async (payload, _, dispatch) => {
      await this.api.start(payload.id);
      await dispatch({ type: 'list/load' });
    });
    
    this.addEffect('contract/finish', async (payload, _, dispatch) => {
      await this.api.finish(payload.id);
      await dispatch({ type: 'list/load' });
    });
    
    this.addEffect('contract/terminate', async (payload, _, dispatch) => {
      await this.api.terminate(payload.id, payload.reason);
      await dispatch({ type: 'list/load' });
    });
    
    this.addEffect('contract/delete', async (payload, _, dispatch) => {
      await this.api.del(payload.id);
      await dispatch({ type: 'list/load' });
    });
  }

  async load() { await this.dispatch({ type: 'list/load' }); }
  async loadDetail(id) { await this.dispatch({ type: 'detail/load', payload: { id } }); }
  async create(data) { await this.dispatch({ type: 'contract/create', payload: { data } }); }
  async update(id, data) { await this.dispatch({ type: 'contract/update', payload: { id, data } }); }
  async submit(id) { await this.dispatch({ type: 'contract/submit', payload: { id } }); }
  async approve(id, result, remark) { await this.dispatch({ type: 'contract/approve', payload: { id, result, remark } }); }
  async start(id) { await this.dispatch({ type: 'contract/start', payload: { id } }); }
  async finish(id) { await this.dispatch({ type: 'contract/finish', payload: { id } }); }
  async terminate(id, reason) { await this.dispatch({ type: 'contract/terminate', payload: { id, reason } }); }
  async delete(id) { await this.dispatch({ type: 'contract/delete', payload: { id } }); }
  setFilter(filter) { this.dispatch({ type: 'filter/update', payload: filter }); this.load(); }
  setPage(page) { this.dispatch({ type: 'page/set', payload: page }); this.load(); }
}

export default new ContractStore();