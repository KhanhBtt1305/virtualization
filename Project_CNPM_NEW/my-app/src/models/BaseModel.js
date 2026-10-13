export class BaseModel {
  constructor(input = {}, options = {}) {
    // timestamp fields (accept string/Date/null)
    this.created_at = input.created_at ? new Date(input.created_at) : new Date();
    this.updated_at = input.updated_at ? new Date(input.updated_at) : new Date();
    this.isDeleted = !!input.isDeleted;
    // options.allowedDates: array of keys to cast to Date
    if (options.allowedDates) {
      options.allowedDates.forEach(k => {
        if (input[k]) this[k] = (input[k] instanceof Date) ? input[k] : new Date(input[k]);
      });
    }
  }

  create() {
    if (!this.created_at) this.created_at = new Date();
    this.updated_at = new Date();
    return this;
  }

  update(updates = {}) {
    Object.keys(updates).forEach(k => {
      // keep Date objects for known date-like fields (if passed)
      const v = updates[k];
      this[k] = (k.endsWith('_at') || k.endsWith('_date')) && v ? (v instanceof Date ? v : new Date(v)) : v;
    });
    this.updated_at = new Date();
    return this;
  }

  softDelete() {
    this.isDeleted = true;
    this.updated_at = new Date();
    return this;
  }

  toPlainObject() {
    const out = {};
    Object.keys(this).forEach(k => {
      const v = this[k];
      out[k] = (v instanceof Date) ? v.toISOString() : v;
    });
    return out;
  }
}