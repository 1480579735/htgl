import request from '../../core/api';

export default {
  list(params) { return request.get('/contracts', params); },
  get(id) { return request.get(`/contracts/${id}`); },
  create(data) { return request.post('/contracts', data); },
  update(id, data) { return request.put(`/contracts/${id}`, data); },
  submit(id) { return request.post(`/contracts/${id}/submit`); },
  approve(id, result, remark) { return request.post(`/contracts/${id}/approve`, { result, remark }); },
  start(id) { return request.post(`/contracts/${id}/start`); },
  finish(id) { return request.post(`/contracts/${id}/finish`); },
  terminate(id, reason) { return request.post(`/contracts/${id}/terminate`, { reason }); },
  del(id) { return request.delete(`/contracts/${id}`); },
  getStats() { return request.get('/contracts/stats/dashboard'); },
  getExpiring(days) { return request.get('/contracts/expiring/list', { days }); }
};