class User {
  constructor(data = {}) {
    this.id = data.id || null;
    this.name = data.name || '';
    this.pwd = data.pwd || '';
    this.realName = data.real_name || data.realName || '';
    this.role = data.role || 'user';
    this.status = data.status !== undefined ? data.status : 1;
    this.createdAt = data.created_at ? new Date(data.created_at) : (data.createdAt ? new Date(data.createdAt) : null);
    this.updatedAt = data.updated_at ? new Date(data.updated_at) : (data.updatedAt ? new Date(data.updatedAt) : null);
  }
  
  toJSON() {
    return {
      id: this.id,
      name: this.name,
      realName: this.realName,
      role: this.role,
      status: this.status
    };
  }
}

module.exports = User;