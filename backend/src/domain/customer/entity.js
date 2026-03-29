class Customer {
  constructor(data = {}) {
    this.id = data.id || null;
    this.code = data.code || '';
    this.name = data.name || '';
    this.contact = data.contact || '';
    this.phone = data.phone || '';
    this.email = data.email || '';
    this.risk = data.risk !== undefined ? data.risk : 0;
    this.address = data.address || '';
    this.createdAt = data.createdAt ? new Date(data.createdAt) : null;
    this.updatedAt = data.updatedAt ? new Date(data.updatedAt) : null;
  }

  validate() {
    const errors = [];

    if (!this.name || this.name.trim() === '') {
      errors.push('客户名称不能为空');
    } else if (this.name.length > 100) {
      errors.push('客户名称不能超过100个字符');
    }

    if (!this.code || this.code.trim() === '') {
      errors.push('客户编码不能为空');
    } else if (this.code.length > 50) {
      errors.push('客户编码不能超过50个字符');
    }

    if (this.email && !/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(this.email)) {
      errors.push('邮箱格式不正确');
    }

    if (this.phone && !/^1[3-9]\d{9}$/.test(this.phone)) {
      errors.push('手机号格式不正确');
    }

    if (errors.length) {
      throw new Error(errors.join('；'));
    }
    return true;
  }

  toJSON() {
    return {
      id: this.id,
      code: this.code,
      name: this.name,
      contact: this.contact,
      phone: this.phone,
      email: this.email,
      risk: this.risk,
      address: this.address,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }

  toDatabase() {
    return {
      code: this.code,
      name: this.name,
      contact: this.contact,
      phone: this.phone,
      email: this.email,
      risk: this.risk,
      address: this.address
    };
  }
}

module.exports = Customer;