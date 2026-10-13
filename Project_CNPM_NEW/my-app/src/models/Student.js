// model class for student
export class Student {
  constructor(input = {}) {
    // flexible mapping: accept snake_case, camelCase or simple keys used elsewhere
    this.student_id = input.student_id ?? input.id ?? null;
    this.student_code = input.student_code ?? input.studentCode ?? input.code ?? null;
    this.full_name = input.full_name ?? input.fullName ?? input.name ?? '';
    this.class_name = input.class_name ?? input.className ?? input.class ?? '';
    this.school_name = input.school_name ?? input.schoolName ?? '';
    this.phone = input.phone ?? '';
    this.email = input.email ?? '';
    this.date_of_birth = this._toDate(input.date_of_birth ?? input.dateOfBirth ?? null);
    this.gender = input.gender ?? 'other';
    this.parent_name = input.parent_name ?? input.parentName ?? '';
    this.parent_phone = input.parent_phone ?? input.parentPhone ?? '';
    this.parent_email = input.parent_email ?? input.parentEmail ?? '';
    this.home_address = input.home_address ?? input.homeAddress ?? input.address ?? '';
    this.pickup_stop_id = input.pickup_stop_id ?? input.pickupStopId ?? null;
    this.dropoff_stop_id = input.dropoff_stop_id ?? input.dropoffStopId ?? null;
    this.route_id = input.route_id ?? input.routeId ?? input.route ?? null;
    this.is_active = input.is_active ?? (input.isActive ?? true);
    this.enrollment_date = this._toDate(input.enrollment_date ?? input.enrollmentDate ?? null);
    this.avatar_url = input.avatar_url ?? input.avatarUrl ?? null;
    this.created_at = this._toDate(input.created_at ?? input.createdAt ?? null);
    this.updated_at = this._toDate(input.updated_at ?? input.updatedAt ?? null);

  }

  _toDate(v) {
    if (!v) return null;
    if (v instanceof Date) return v;
    const d = new Date(v);
    return isNaN(d.getTime()) ? null : d;
  }

  getAge(asOf = new Date()) {
    if (!this.date_of_birth) return null;
    const dob = this.date_of_birth;
    let age = asOf.getFullYear() - dob.getFullYear();
    const m = asOf.getMonth() - dob.getMonth();
    if (m < 0 || (m === 0 && asOf.getDate() < dob.getDate())) age--;
    return age;
  }

  

  toPlainObject() {
    return {
      student_id: this.student_id,
      student_code: this.student_code,
      full_name: this.full_name,
      class_name: this.class_name,
      school_name: this.school_name,
      phone: this.phone,
      email: this.email,
      date_of_birth: this.date_of_birth ? this.date_of_birth.toISOString().split('T')[0] : null,
      gender: this.gender,
      parent_name: this.parent_name,
      parent_phone: this.parent_phone,
      parent_email: this.parent_email,
      home_address: this.home_address,
      pickup_stop_id: this.pickup_stop_id,
      dropoff_stop_id: this.dropoff_stop_id,
      route_id: this.route_id,
      is_active: this.is_active,
      enrollment_date: this.enrollment_date ? this.enrollment_date.toISOString().split('T')[0] : null,
      avatar_url: this.avatar_url,
      created_at: this.created_at ? this.created_at.toISOString() : null,
      updated_at: this.updated_at ? this.updated_at.toISOString() : null,
    };
  }

  // small helper used by UI
  getDisplayName() {
    return this.full_name || this.student_code || 'Unknown';
  }
}
export const defaultStudents = [
  new Student({
    student_id: 1,
    student_code: 'S001',
    full_name: 'Nguyễn Văn A',
    class_name: '10A1',
    school_name: 'THPT Nguyễn Huệ',
    phone: '0912345678',
    email: 'nguyenvana@email.com',
    date_of_birth: '2008-05-15',
    gender: 'male',
    parent_name: 'Nguyễn Văn X',
    parent_phone: '0987654321',
    parent_email: 'parentA@email.com',
    home_address: '123 Đường A, Quận 1, TP.HCM',
    pickup_stop_id: 1,
    dropoff_stop_id: 5,
    route_id: 1,
    is_active: true,
    enrollment_date: '2023-09-01',
    avatar_url: null,
  }),
  new Student({
    student_id: 2,
    student_code: 'S002',
    full_name: 'Trần Thị B',
    class_name: '10A1',
    school_name: 'THPT Nguyễn Huệ',
    phone: '0912345679',
    email: 'tranthib@email.com',
    date_of_birth: '2008-08-20',
    gender: 'female',
    parent_name: 'Trần Văn Y',
    parent_phone: '0987654322',
    parent_email: 'parentB@email.com',
    home_address: '456 Đường B, Quận 2, TP.HCM',
    pickup_stop_id: 2,
    dropoff_stop_id: 6,
    route_id: 2,
    is_active: true,
    enrollment_date: '2023-09-01',
    avatar_url: null,
  }),
  new Student({
    student_id: 3,
    student_code: 'S003',
    full_name: 'Lê Văn C',
    class_name: '10A2',
    school_name: 'THPT Nguyễn Huệ',
    phone: '0912345680',
    email: 'levanc@email.com',
    date_of_birth: '2008-03-10',
    gender: 'male',
    parent_name: 'Lê Văn Z',
    parent_phone: '0987654323',
    parent_email: 'parentC@email.com',
    home_address: '789 Đường C, Quận 3, TP.HCM',
    pickup_stop_id: 3,
    dropoff_stop_id: 7,
    route_id: 1,
    is_active: true,
    enrollment_date: '2023-09-01',
    avatar_url: null,
  }),
  new Student({
    student_id: 4,
    student_code: 'S004',
    full_name: 'Phạm Thị D',
    class_name: '10A2',
    school_name: 'THPT Nguyễn Huệ',
    phone: '0912345681',
    email: 'phamthid@email.com',
    date_of_birth: '2008-12-05',
    gender: 'female',
    parent_name: 'Phạm Văn K',
    parent_phone: '0987654324',
    parent_email: 'parentD@email.com',
    home_address: '321 Đường D, Quận 4, TP.HCM',
    pickup_stop_id: 1,
    dropoff_stop_id: 5,
    route_id: 3,
    is_active: true,
    enrollment_date: '2023-09-01',
    avatar_url: null,
  }),
  new Student({
    student_id: 5,
    student_code: 'S005',
    full_name: 'Hoàng Văn E',
    class_name: '10A3',
    school_name: 'THPT Trần Phú',
    phone: '0912345682',
    email: 'hoangvane@email.com',
    date_of_birth: '2008-07-18',
    gender: 'male',
    parent_name: 'Hoàng Văn L',
    parent_phone: '0987654325',
    parent_email: 'parentE@email.com',
    home_address: '654 Đường E, Quận 5, TP.HCM',
    pickup_stop_id: 2,
    dropoff_stop_id: 6,
    route_id: 2,
    is_active: true,
    enrollment_date: '2023-09-01',
    avatar_url: null,
  }),
  new Student({
    student_id: 6,
    student_code: 'S006',
    full_name: 'Vũ Thị F',
    class_name: '10A3',
    school_name: 'THPT Trần Phú',
    phone: '0912345683',
    email: 'vuthif@email.com',
    date_of_birth: '2008-11-25',
    gender: 'female',
    parent_name: 'Vũ Văn M',
    parent_phone: '0987654326',
    parent_email: 'parentF@email.com',
    home_address: '987 Đường F, Quận 6, TP.HCM',
    pickup_stop_id: 3,
    dropoff_stop_id: 7,
    route_id: 1,
    is_active: true,
    enrollment_date: '2023-09-01',
    avatar_url: null,
  }),
  new Student({
    student_id: 7,
    student_code: 'S007',
    full_name: 'Đặng Văn G',
    class_name: '11A1',
    school_name: 'THPT Trần Phú',
    phone: '0912345684',
    email: 'dangvang@email.com',
    date_of_birth: '2007-04-12',
    gender: 'male',
    parent_name: 'Đặng Văn N',
    parent_phone: '0987654327',
    parent_email: 'parentG@email.com',
    home_address: '147 Đường G, Quận 7, TP.HCM',
    pickup_stop_id: 4,
    dropoff_stop_id: 8,
    route_id: 3,
    is_active: true,
    enrollment_date: '2023-09-01',
    avatar_url: null,
  }),
  new Student({
    student_id: 8,
    student_code: 'S008',
    full_name: 'Bùi Thị H',
    class_name: '11A1',
    school_name: 'THPT Lý Thái Tổ',
    phone: '0912345685',
    email: 'buithih@email.com',
    date_of_birth: '2007-09-30',
    gender: 'female',
    parent_name: 'Bùi Văn O',
    parent_phone: '0987654328',
    parent_email: 'parentH@email.com',
    home_address: '258 Đường H, Quận 8, TP.HCM',
    pickup_stop_id: 1,
    dropoff_stop_id: 5,
    route_id: 2,
    is_active: true,
    enrollment_date: '2023-09-01',
    avatar_url: null,
  }),
  new Student({
    student_id: 9,
    student_code: 'S009',
    full_name: 'Ngô Văn I',
    class_name: '11A2',
    school_name: 'THPT Lý Thái Tổ',
    phone: '0912345686',
    email: 'ngvani@email.com',
    date_of_birth: '2007-06-08',
    gender: 'male',
    parent_name: 'Ngô Văn P',
    parent_phone: '0987654329',
    parent_email: 'parentI@email.com',
    home_address: '369 Đường I, Quận 9, TP.HCM',
    pickup_stop_id: 2,
    dropoff_stop_id: 6,
    route_id: 1,
    is_active: false,
    enrollment_date: '2023-09-01',
    avatar_url: null,
  }),
  new Student({
    student_id: 10,
    student_code: 'S010',
    full_name: 'Trịnh Thị K',
    class_name: '11A2',
    school_name: 'THPT Lý Thái Tổ',
    phone: '0912345687',
    email: 'trinhthik@email.com',
    date_of_birth: '2007-01-22',
    gender: 'female',
    parent_name: 'Trịnh Văn Q',
    parent_phone: '0987654330',
    parent_email: 'parentK@email.com',
    home_address: '159 Đường K, Quận 10, TP.HCM',
    pickup_stop_id: 3,
    dropoff_stop_id: 7,
    route_id: 3,
    is_active: true,
    enrollment_date: '2023-09-01',
    avatar_url: null,
  }),
  new Student({
    student_id: 11,
    student_code: 'S011',
    full_name: 'Lý Văn L',
    class_name: '12A1',
    school_name: 'THPT Lý Thái Tổ',
    phone: '0912345688',
    email: 'lyvanl@email.com',
    date_of_birth: '2006-10-14',
    gender: 'male',
    parent_name: 'Lý Văn R',
    parent_phone: '0987654331',
    parent_email: 'parentL@email.com',
    home_address: '753 Đường L, Quận 11, TP.HCM',
    pickup_stop_id: 4,
    dropoff_stop_id: 8,
    route_id: 2,
    is_active: true,
    enrollment_date: '2023-09-01',
    avatar_url: null,
  }),
  new Student({
    student_id: 12,
    student_code: 'S012',
    full_name: 'Tô Thị M',
    class_name: '12A1',
    school_name: 'THPT Võ Thị Sáu',
    phone: '0912345689',
    email: 'tothim@email.com',
    date_of_birth: '2006-02-28',
    gender: 'female',
    parent_name: 'Tô Văn S',
    parent_phone: '0987654332',
    parent_email: 'parentM@email.com',
    home_address: '456 Đường M, Quận 12, TP.HCM',
    pickup_stop_id: 1,
    dropoff_stop_id: 5,
    route_id: 1,
    is_active: true,
    enrollment_date: '2023-09-01',
    avatar_url: null,
  }),
]