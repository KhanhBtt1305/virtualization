import { BaseModel } from './BaseModel';

export class User extends BaseModel {
  constructor(input = {}) {
    super(input);
    this.user_id = input.user_id ?? null;
    this.username = input.username ?? '';
    this.password = input.password ?? '';
    this.email = input.email ?? '';
    this.user_role = input.user_role ?? 'driver';
    this.is_active = typeof input.is_active === 'boolean' ? input.is_active : true;
  }
}