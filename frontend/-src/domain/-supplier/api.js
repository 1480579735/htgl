import request from '../../core/api';

export default {
  list(params) { return request.get('/suppliers', params); },
  get(id) { return request.get(`/suppliers/${id}`); },
  create(data) { return request.post('/suppliers', data); },
  update(id, data) { return request.put(`/suppliers/${id}`, data); },
  updateStatus(id, status) { return request.patch(`/suppliers/${id}/status`, { status }); },
  updateRating(id, rating) { return request.patch(`/suppliers/${id}/rating`, { rating }); },
  del(id) { return request.delete(`/suppliers/${id}`); },
  getStats() { return request.get('/suppliers/stats/dashboard'); },
  getTop(limit = 10) { return request.get('/suppliers/top/list', { limit }); }
};