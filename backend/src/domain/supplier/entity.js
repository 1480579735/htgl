class Supplier {
  constructor(data = {}) {
    this.id = data.id || null;
    this.code = data.code || '';
    this.name = data.name || '';
    this.contact = data.contact || '';
    this.phone = data.phone || '';
    this.email = data.email || '';
    this.address = data.address || '';
    this.bankName = data.bank_name || data.bankName || '';
    this.bankAccount = data.bank_account || data.bankAccount || '';
    this.taxNo = data.tax_no || data.taxNo || '';
    this.rating = data.rating !== undefined ? data.rating : 3;
    this.status = data.status !== undefined ? data.status : 1;
    this.createdAt = data.created_at ? new Date(data.created_at) : (data.createdAt ? new Date(data.createdAt) : null);
    this.updatedAt = data.updated_at ? new Date(data.updated_at) : (data.updatedAt ? new Date(data.updatedAt) : null);
  }

  validate() {
    const errors = [];

    if (!this.name || this.name.trim() === '') {
      errors.push('供应商名称不能为空');
    } else if (this.name.length > 100) {
      errors.push('供应商名称不能超过100个字符');
    }

    if (!this.code || this.code.trim() === '') {
      errors.push('供应商编码不能为空');
    } else if (this.code.length > 50) {
      errors.push('供应商编码不能超过50个字符');
    }

    if (this.email && !/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(this.email)) {
      errors.push('邮箱格式不正确');
    }

    if (this.phone && !/^1[3-9]\d{9}$/.test(this.phone)) {
      errors.push('手机号格式不正确');
    }

    if (this.rating < 1 || this.rating > 5) {
      errors.push('供应商等级必须在1-5之间');
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
      address: this.address,
      bankName: this.bankName,
      bankAccount: this.bankAccount,
      taxNo: this.taxNo,
      rating: this.rating,
      status: this.status,
      statusText: this.getStatusText(),
      ratingText: this.getRatingText(),
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
      address: this.address,
      bank_name: this.bankName,
      bank_account: this.bankAccount,
      tax_no: this.taxNo,
      rating: this.rating,
      status: this.status
    };
  }

  getStatusText() {
    return this.status === 1 ? '启用' : '停用';
  }

  getRatingText() {
    const map = { 1: '★', 2: '★★', 3: '★★★', 4: '★★★★', 5: '★★★★★' };
    return map[this.rating] || '★★★';
  }
}

module.exports = Supplier;