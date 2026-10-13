import { BaseModel } from './BaseModel';

export class Driver extends BaseModel {
  constructor(input = {}) {
    super(input, { allowedDates: ['date_of_birth', 'join_date'] });
    this.driver_id = input.driver_id ?? null;
    this.user_id = input.user_id ?? null;
    this.driver_code = input.driver_code ?? '';
    this.full_name = input.full_name ?? '';
    this.phone = input.phone ?? '';
    this.email = input.email ?? '';
    this.date_of_birth = input.date_of_birth ? new Date(input.date_of_birth) : null;
    this.id_card = input.id_card ?? '';
    this.gender = input.gender ?? null;
    this.license_type = input.license_type ?? '';
    this.rating = (typeof input.rating === 'number') ? input.rating : (input.rating ? Number(input.rating) : 5.0);
    this.total_trips = input.total_trips ?? 0;
    this.completed_trips = input.completed_trips ?? 0;
    this.bank_account = input.bank_account ?? '';
    this.bank_name = input.bank_name ?? '';
    this.account_holder = input.account_holder ?? '';
    this.status = input.status ?? 'active';
    this.join_date = input.join_date ? new Date(input.join_date) : null;
    this.profile_image_url = input.profile_image_url ?? null;
  }
}