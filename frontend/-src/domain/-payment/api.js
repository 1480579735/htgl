import request from '../../core/api';

export default {
  list(params) { return request.get('/payments', params); },
  get(id) { return request.get(`/payments/${id}`); },
  create(data) { return request.post('/payments', data); },
  update(id, data) { return request.put(`/payments/${id}`, data); },
  pay(id, data) { return request.post(`/payments/${id}/pay`, data); },
  del(id) { return request.delete(`/payments/${id}`); },
  getOverdue() { return request.get('/payments/overdue/list'); }
};