const BASE_URL = '/api';

class HttpClient {
  constructor() {
    this.token = localStorage.getItem('token');
  }

  setToken(token) {
    this.token = token;
    if (token) {
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token');
    }
  }

  async request(url, options = {}) {
    const fullUrl = url.startsWith('http') ? url : `${BASE_URL}${url}`;
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers
    };
    
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }
    
    try {
      const response = await fetch(fullUrl, { ...options, headers });
      const data = await response.json();
      
      if (response.status === 401) {
        this.setToken(null);
        window.location.href = '/login';
        throw new Error('请重新登录');
      }
      
      if (data.code !== 0) {
        throw new Error(data.msg || '请求失败');
      }
      
      return data.data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  get(url, params = {}) {
    const query = new URLSearchParams(params).toString();
    const fullUrl = query ? `${url}?${query}` : url;
    return this.request(fullUrl, { method: 'GET' });
  }

  post(url, data = {}) {
    return this.request(url, { method: 'POST', body: JSON.stringify(data) });
  }

  put(url, data = {}) {
    return this.request(url, { method: 'PUT', body: JSON.stringify(data) });
  }

  patch(url, data = {}) {
    return this.request(url, { method: 'PATCH', body: JSON.stringify(data) });
  }

  delete(url) {
    return this.request(url, { method: 'DELETE' });
  }
}

export default new HttpClient();