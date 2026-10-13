import { BaseModel } from './BaseModel';

export default class Stop extends BaseModel {
  constructor(input = {}) {
    super(input, { allowedDates: ['arrival_time'] });
    this.stop_id = input.stop_id ?? null;
    this.route_id = input.route_id ?? null;
    this.stop_code = input.stop_code ?? '';
    this.stop_name = input.stop_name ?? '';
    this.address = input.address ?? '';
    this.latitude = input.latitude != null ? Number(input.latitude) : null;
    this.longitude = input.longitude != null ? Number(input.longitude) : null;
    this.stop_order = input.stop_order ?? null;
    // arrival_time kept as TIME string (or Date if provided)
    this.arrival_time = input.arrival_time ? (input.arrival_time instanceof Date ? input.arrival_time : input.arrival_time) : null;
    this.student_count = input.student_count ?? 0;
    this.stop_type = input.stop_type ?? 'both';
  }

  // update supports partial object
  update(updates = {}) {
    return super.update(updates);
  }

  toPlainObject() {
    const o = super.toPlainObject();
    // keep arrival_time as raw if it's a Date convert to time string
    if (this.arrival_time instanceof Date) {
      o.arrival_time = this.arrival_time.toTimeString().slice(0,8);
    }
    return o;
  }
}
export const stops = [
  new Stop({
    stop_id: 1,
    route_id: 101,
    stop_code: "ST001",
    stop_name: "Điểm dừng 1",
    address: "12 Nguyễn Huệ, Quận 1, TP. Hồ Chí Minh",
    latitude: 10.773374,
    longitude: 106.704146,
    stop_order: 1,
    arrival_time: "07:00:00",
    student_count: 5,
    stop_type: "pickup"
  }),
  new Stop({
    stop_id: 2,
    route_id: 101,
    stop_code: "ST002",
    stop_name: "Điểm dừng 2",
    address: "88 Lê Lợi, Quận 1, TP. Hồ Chí Minh",
    latitude: 10.772509,
    longitude: 106.699143,
    stop_order: 2,
    arrival_time: "07:10:00",
    student_count: 3,
    stop_type: "pickup"
  }),
  new Stop({
    stop_id: 3,
    route_id: 101,
    stop_code: "ST003",
    stop_name: "Điểm dừng 3",
    address: "25 Nguyễn Thị Minh Khai, Quận 1, TP. Hồ Chí Minh",
    latitude: 10.780918,
    longitude: 106.700359,
    stop_order: 3,
    arrival_time: "07:20:00",
    student_count: 4,
    stop_type: "pickup"
  }),
  new Stop({
    stop_id: 4,
    route_id: 101,
    stop_code: "ST004",
    stop_name: "Điểm dừng 4",
    address: "150 Hai Bà Trưng, Quận 3, TP. Hồ Chí Minh",
    latitude: 10.784108,
    longitude: 106.689964,
    stop_order: 4,
    arrival_time: "07:30:00",
    student_count: 2,
    stop_type: "both"
  }),
  new Stop({
    stop_id: 5,
    route_id: 101,
    stop_code: "ST005",
    stop_name: "Điểm dừng 5",
    address: "45 Trường Sa, Quận Bình Thạnh, TP. Hồ Chí Minh",
    latitude: 10.797372,
    longitude: 106.682312,
    stop_order: 5,
    arrival_time: "07:40:00",
    student_count: 6,
    stop_type: "pickup"
  }),
  new Stop({
    stop_id: 6,
    route_id: 101,
    stop_code: "ST006",
    stop_name: "Điểm dừng 6",
    address: "100 Điện Biên Phủ, Quận Bình Thạnh, TP. Hồ Chí Minh",
    latitude: 10.799841,
    longitude: 106.709545,
    stop_order: 6,
    arrival_time: "07:50:00",
    student_count: 2,
    stop_type: "dropoff"
  }),
  new Stop({
    stop_id: 7,
    route_id: 101,
    stop_code: "ST007",
    stop_name: "Điểm dừng 7",
    address: "200 Nguyễn Văn Linh, Quận 7, TP. Hồ Chí Minh",
    latitude: 10.732229,
    longitude: 106.721268,
    stop_order: 7,
    arrival_time: "08:00:00",
    student_count: 7,
    stop_type: "both"
  }),
  new Stop({
    stop_id: 8,
    route_id: 101,
    stop_code: "ST008",
    stop_name: "Điểm dừng 8",
    address: "15 Lê Văn Việt, TP. Thủ Đức, TP. Hồ Chí Minh",
    latitude: 10.845231,
    longitude: 106.794789,
    stop_order: 8,
    arrival_time: "08:10:00",
    student_count: 4,
    stop_type: "pickup"
  }),
  new Stop({
    stop_id: 9,
    route_id: 101,
    stop_code: "ST009",
    stop_name: "Điểm dừng 9",
    address: "23 Kha Vạn Cân, TP. Thủ Đức, TP. Hồ Chí Minh",
    latitude: 10.853381,
    longitude: 106.737312,
    stop_order: 9,
    arrival_time: "08:20:00",
    student_count: 5,
    stop_type: "dropoff"
  }),
  new Stop({
    stop_id: 10,
    route_id: 101,
    stop_code: "ST010",
    stop_name: "Điểm dừng 10",
    address: "Trường Tiểu Học ABC, Quận 1, TP. Hồ Chí Minh",
    latitude: 10.776888,
    longitude: 106.703112,
    stop_order: 10,
    arrival_time: "08:30:00",
    student_count: 0,
    stop_type: "dropoff"
  })
];