import request from '../../core/api';

export default {
  list(params) { return request.get('/customers', params); },
  get(id) { return request.get(`/customers/${id}`); },
  create(data) { return request.post('/customers', data); },
  update(id, data) { return request.put(`/customers/${id}`, data); },
  updateRisk(id, risk) { return request.patch(`/customers/${id}/risk`, { risk }); },
  del(id) { return request.delete(`/customers/${id}`); }
};