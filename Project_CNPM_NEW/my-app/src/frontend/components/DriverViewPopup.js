// File: src/frontend/components/DriverViewPopup.js
import React from 'react';
import "../QuanLyTaiXe.css"; // Dùng chung CSS
import { DAYS_OF_WEEK_MAP } from "./WorkScheduleCheckboxes";

export default function DriverViewPopup({ isOpen, onClose, driverData }) {
  if (!isOpen || !driverData) return null;

  const formatSchedule = (scheduleString) => {
    if (!scheduleString) return 'Chưa gán';
    return scheduleString.split(',')
                         .map(dayKey => DAYS_OF_WEEK_MAP[dayKey] || dayKey)
                         .join(', ');
  };

  return (
    <div className="popup-overlay">
      <div className="popup driver-view-popup"> 
        <div className="popup-header">
          <h2>Thông tin tài xế: {driverData.name}</h2>
          <button className="close-btn" onClick={onClose}>✖</button>
        </div>
        
        <div className="driver-view-content">
          <div className="view-group"><strong>Mã tài xế:</strong><span>{driverData.id}</span></div>
          <div className="view-group"><strong>Họ tên:</strong><span>{driverData.name}</span></div>
          <div className="view-group"><strong>Số điện thoại:</strong><span>{driverData.phone}</span></div>
          <div className="view-group"><strong>Địa chỉ:</strong><span>{driverData.address}</span></div>
          <div className="view-group"><strong>Trạng thái:</strong><span>{driverData.status}</span></div>
          <div className="view-group"><strong>Tuyến đường:</strong><span>{driverData.route || 'N/A'}</span></div>
          <div className="view-group"><strong>Hạng bằng lái:</strong><span>{driverData.licenseClass}</span></div>
          <div className="view-group"><strong>Số chuyến/tuần:</strong><span>{driverData.weeklyTrips}</span></div>
          <div className="view-group">
            <strong>Lịch cố định:</strong>
            <span>{formatSchedule(driverData.work_schedule)}</span>
          </div>
        </div>
        
        <div className="popup-footer">
          <button type="button" className="btn-cancel" onClick={onClose}>Đóng</button>
        </div>
      </div>
    </div>
  );
}