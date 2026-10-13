import React from "react";
import "./DemoTk.css";
import anh from './assets/image/MAU.jpg'; // đường dẫn tới ảnh bus

// 1. Cảnh báo
function WarningCard() {
  return (
    <div className="tk-card tk-card-warning">
      <h3>Thông báo (7)</h3>
      <ul>
        <li>Xe buýt 01 - Chậm 10 phút</li>
        <li>10 học sinh vắng mặt chưa xác nhận</li>
        <li>Xe bus 06 - Chậm 5 phút</li>
        <li>Tài xế nhắn tin (10)</li>
        <li>Xe buýt gặp sự cố</li>
        <li>3 học sinh đến trễ</li>
        <li>Xe buýt 07 - Chậm 20 phút</li>
      </ul>
      <button className="tk-button">Xem Chi tiết</button>
    </div>
  );
}

// 2. Bản đồ Tuyến xe Trực tiếp
function LiveMapCard() {
  return (
    <div className="tk-card tk-card-livemap">
      <h3>
        Trạng thái vận hành
      </h3>
      <div className="map-sim">
        <img
          src={anh}
          alt="Bus"
          className="bus-icon"
        />
      </div>
      <p className="status-text">
        Tất cả các tuyến đang hoạt động tốt.
      </p>
    </div>
  );
}

// Component chính
function DemoTk() {
  return (
    <div className="tk-container">
      <div className="tk-row tk-row-top">
        <LiveMapCard />
        <WarningCard />
      </div>
    </div>
  );
}

export default DemoTk;