import React, { useState } from "react";
import { BaseModel } from "./BaseModel.js";
export class Route extends BaseModel {
    constructor(input = {}) {
    super(input, { allowedDates: [] });
    this.route_id = input.route_id ?? null;
    this.route_code = input.route_code ?? '';
    this.route_name = input.route_name ?? '';
    this.start_location = input.start_location ?? '';
    this.end_location = input.end_location ?? '';
    // planned_start/planned_end are TIME strings in DB, keep as string (HH:MM[:SS])
    this.planned_start = input.planned_start ?? input.plannedStart ?? '';
    this.planned_end = input.planned_end ?? input.plannedEnd ?? '';
    this.total_students = input.total_students ?? 0;
    this.distance_km = (input.distance_km != null) ? Number(input.distance_km) : null;
    this.estimated_duration_minutes = input.estimated_duration_minutes ?? null;
    this.status = input.status ?? 'active';
  }

  getPlannedStart() { return this.planned_start; }
  getPlannedEnd() { return this.planned_end; }

  update(updates = {}) {
    Object.keys(updates).forEach(k => {
      if (k in this) this[k] = updates[k];
    });
    this.updated_at = new Date();
    return this;
  }

  toPlainObject() {
    return {
      route_id: this.route_id,
      route_code: this.route_code,
      route_name: this.route_name,
      start_location: this.start_location,
      end_location: this.end_location,
      planned_start: this.planned_start,
      planned_end: this.planned_end,
      total_students: this.total_students,
      distance_km: this.distance_km,
      estimated_duration_minutes: this.estimated_duration_minutes,
      status: this.status,
      created_at: this.created_at instanceof Date ? this.created_at.toISOString() : this.created_at,
      updated_at: this.updated_at instanceof Date ? this.updated_at.toISOString() : this.updated_at,
    };
  }
toTableRow(handledetailroute=()=>{}) {
    const statusIcon = this.getStatusIcon();
    const statusText = this.getStatusText();
    const statusClass = this.status==="active" ? `status status-${"stable"}`: `status status-${"danger"}`;
  return (
    <tr>
        <td><strong>{this.route_code}</strong>
            </td>
        <td>
            <div>{this.route_name}</div>
        </td>
        <td>{this.start_location}</td>
        <td>{this.distance_km}km </td>
        <td>{this.total_students}</td>
        <td>Từ {this.planned_start} Đến {this.planned_end}</td>
        <td><span class={statusClass}>{statusIcon} {statusText}</span></td>
        <td><button class="btn-detail" data-id={this.route_code} onClick={()=>handledetailroute(this)} ><i class="fas fa-eye"></i> Xem chi tiết</button></td>
    </tr>
  );
            } 
    // Phương thức lấy icon trạng thái
            getStatusIcon() {
                const iconMap = {
                    'stable': <i class="fas fa-check-circle"></i>,
                    'warning': <i class="fas fa-exclamation-triangle"></i>,
                    'danger': <i class="fas fa-times-circle"></i>,
                    'active': <i class="fas fa-check-circle"></i>,
                    'inactive': <i class="fas fa-times-circle"></i>
                };
                return iconMap[this.status] || <i class="fas fa-question-circle"></i>;
            }
    // Phương thức lấy văn bản trạng thái
            getStatusText() {
                const statusMap = {
                    'stable': 'Ổn định',
                    'warning': 'Có vấn đề',
                    'danger': 'Nguy hiểm',
                    "active": 'Hoạt động',
                    "inactive": 'Không hoạt động'
                };
                return statusMap[this.status] || 'Không xác định';
            }
    addthis(){


        return (
            <div class="container">
        <div class="main-content">
            <div class="section">
                <h2 class="section-title">Chọn tuyến đường</h2>
                <div class="form-group">
                    <label for="start-address">Nhập địa chỉ bắt đầu</label>
                    <input type="text" id="start-address" placeholder="Nhập địa chỉ bắt đầu"/>
                </div>
                <div class="form-group">
                    <label for="end-address">Nhập địa chỉ kết thúc</label>
                    <input type="text" id="end-address" placeholder="Nhập địa chỉ kết thúc"/>
                </div>
            </div>
            
            <div class="section">
                <h2 class="section-title">Tạo Tuyến Tuyến Xe Mới</h2>
                
                <div class="form-group">
                    <label for="this-name">Tên tuyến xe</label>
                    <input type="text" id="this-name" placeholder="Nhập tên tuyến xe"/>
                </div>
                
                <div class="form-group">
                    <label>Các Trạm đi qua</label>
                    <div class="stations-list" id="stations-list">
                        <div class="station-item">
                            <span class="station-name">Bến Thành</span>
                            <button class="remove-station">❌</button>
                        </div>
                        <div class="station-item">
                            <span class="station-name">Ba Sơn</span>
                            <button class="remove-station">❌</button>
                        </div>
                        <div class="station-item">
                            <span class="station-name">Nha Hải Thanh Phó</span>
                            <button class="remove-station">❌</button>
                        </div>
                        <div class="station-item">
                            <span class="station-name">Đệnh Viện Quản Y</span>
                            <button class="remove-station">❌</button>
                        </div>
                        <div class="station-item">
                            <span class="station-name">Công Viện Tao Đàn</span>
                            <button class="remove-station">❌</button>
                        </div>
                        <div class="station-item">
                            <span class="station-name">Suối Tiền</span>
                            <button class="remove-station">❌</button>
                        </div>
                    </div>
                    
                    <button class="add-station-btn" id="add-station-btn">
                        <span>+</span> Thêm Trạm
                    </button>
                </div>
                
                <hr/>
                
                <div class="form-group">
                    <label>Thời gian:</label>
                    <div class="time-inputs">
                        <div class="form-group">
                            <label for="start-time">Bắt Đầu</label>
                            <input type="text" id="start-time" placeholder="HH:MM"/>
                        </div>
                        <div class="form-group">
                            <label for="end-time">Kết thúc</label>
                            <input type="text" id="end-time" placeholder="HH:MM"/>
                        </div>
                    </div>
                </div>
                
                <hr/>
                
                <div class="form-group">
                    <label>Tuyến Xe:</label>
                    <div class="this-summary">
                        Bến Thành --- Suối Tiên
                    </div>
                </div>
                
                <button class="save-btn">Lưu Tuyến Xe</button>
            </div>
        </div>
    </div>
        );
    }
    setupStations(stations){
        this.stations = stations;
    }
    setHasVehicle(hasVehicle){
        this.hasVehicle = hasVehicle;
    }
    setStatus(status){
        this.status = status;
    }
    setTimeStart(timeStart){
        this.timeStart = timeStart;
    }
    setTimeEnd(timeEnd){
        this.timeEnd = timeEnd;
    }
    setTotalDistance(totalDistance){
        this.totalDistance = totalDistance;
    }
    setStartStation(startStation){
        this.startStation = startStation;
    }
    setName(name){
        this.name = name;
    }
}
export const defaultRoutes= [
  new Route({
    route_id: 1,
    route_code: 'ROUTE-01',
    route_name: 'Tuyến 01 - Nội thành',
    start_location: 'Bến Thành',
    end_location: 'Suối Tiên',
    planned_start: '05:30',
    planned_end: '09:30',
    total_students: 24,
    distance_km: 18.4,
    estimated_duration_minutes: 60,
    status: 'active'
  }),
  new Route({
    route_id: 2,
    route_code: 'ROUTE-02',
    route_name: 'Tuyến 02 - Bắc Nam',
    start_location: 'Cầu Sài Gòn',
    end_location: 'Bến xe Miền Đông',
    planned_start: '06:00',
    planned_end: '10:00',
    total_students: 18,
    distance_km: 22.1,
    estimated_duration_minutes: 75,
    status: 'active'
  }),
  new Route({
    route_id: 3,
    route_code: 'ROUTE-03',
    route_name: 'Tuyến 03 - Trung tâm',
    start_location: 'Chợ Bến Thành',
    end_location: 'Công viên Tao Đàn',
    planned_start: '05:45',
    planned_end: '09:15',
    total_students: 12,
    distance_km: 9.6,
    estimated_duration_minutes: 40,
    status: 'active'
  }),
  new Route({
    route_id: 4,
    route_code: 'ROUTE-04',
    route_name: 'Tuyến 04 - Tây Bắc',
    start_location: 'Tân Bình',
    end_location: 'Bình Trị Đông',
    planned_start: '06:10',
    planned_end: '10:10',
    total_students: 20,
    distance_km: 26.7,
    estimated_duration_minutes: 90,
    status: 'inactive'
  }),
  new Route({
    route_id: 5,
    route_code: 'ROUTE-05',
    route_name: 'Tuyến 05 - Đông Bắc',
    start_location: 'Gò Vấp',
    end_location: 'Thủ Đức',
    planned_start: '05:50',
    planned_end: '09:50',
    total_students: 16,
    distance_km: 20.3,
    estimated_duration_minutes: 70,
    status: 'active'
  }),
  new Route({
    route_id: 6,
    route_code: 'ROUTE-06',
    route_name: 'Tuyến 06 - Tây Nam',
    start_location: 'Quận 7',
    end_location: 'Bình Chánh',
    planned_start: '06:20',
    planned_end: '10:20',
    total_students: 14,
    distance_km: 30.0,
    estimated_duration_minutes: 100,
    status: 'active'
  }),
  new Route({
    route_id: 7,
    route_code: 'ROUTE-07',
    route_name: 'Tuyến 07 - Vành đai',
    start_location: 'Phú Nhuận',
    end_location: 'Hóc Môn',
    planned_start: '05:40',
    planned_end: '09:40',
    total_students: 10,
    distance_km: 35.2,
    estimated_duration_minutes: 120,
    status: 'inactive'
  }),
  new Route({
    route_id: 8,
    route_code: 'ROUTE-08',
    route_name: 'Tuyến 08 - Liên tỉnh',
    start_location: 'Bến xe Chợ Lớn',
    end_location: 'Biên Hòa',
    planned_start: '04:50',
    planned_end: '17:45',
    total_students: 28,
    distance_km: 45.5,
    estimated_duration_minutes: 180,
    status: 'active'
  }),
  new Route({
    route_id: 9,
    route_code: 'ROUTE-09',
    route_name: 'Tuyến 09 - Cảng',
    start_location: 'Cảng Sài Gòn',
    end_location: 'Khu CN',
    planned_start: '06:30',
    planned_end: '10:30',
    total_students: 9,
    distance_km: 12.0,
    estimated_duration_minutes: 50,
    status: 'active'
  }),
  new Route({
    route_id: 10,
    route_code: 'ROUTE-10',
    route_name: 'Tuyến 10 - Đại học',
    start_location: 'Đại học QG',
    end_location: 'Khu dân cư A',
    planned_start: '07:00',
    planned_end: '11:00',
    total_students: 22,
    distance_km: 15.8,
    estimated_duration_minutes: 65,
    status: 'active'
  })
]

