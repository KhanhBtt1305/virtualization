import React, { useState, useCallback } from "react";
import MapComponent from "./components/MapTracking/MapComponent";
import "./Tracking.css";

function Tracking() {
  // State quản lý dữ liệu
  const [tuKhoaTim, setTuKhoaTim] = useState("");
  const [lanKichHoatTim, setLanKichHoatTim] = useState(0);
  const [tuyenDuongChon, setTuyenDuongChon] = useState(null);
  const [lanCapNhatCuoi, setLanCapNhatCuoi] = useState(null);

  // Hàm xử lý tìm kiếm
  const xuLyTimKiem = () => setLanKichHoatTim(prev => prev + 1);

  // Hàm chọn tuyến đường
  const xuLyChonTuyen = useCallback((thongTinTuyen) => {
    // DEBUG: Kiểm tra dữ liệu nhận được
    if (thongTinTuyen) {
      console.log(`📱 [TRACKING] Nhận dữ liệu:`, {
        distanceTraveled: thongTinTuyen.distanceTraveled,
        routeId: thongTinTuyen.routeId,
        time: new Date().toLocaleTimeString()
      });
    }
    
    if (thongTinTuyen === null) {
      setTuyenDuongChon(null);
      setLanCapNhatCuoi(null);
      return;
    }
    
    // LUÔN CẬP NHẬT KHI CÓ DỮ LIỆU MỚI
    setTuyenDuongChon(thongTinTuyen);
    setLanCapNhatCuoi(new Date());
  }, []);

  // Hàm xác định trạng thái trạm
  const xacDinhTrangThaiTram = useCallback((viTriTram, tramHienTai, trangThai) => {
    if (trangThai === 'waiting') {
      return viTriTram === 0 ? "active-waiting" : "normal";
    } else if (trangThai === 'finished') {
      return viTriTram === tramHienTai ? "active-finished" : (viTriTram < tramHienTai ? "passed" : "normal");
    } else {
      if (viTriTram === tramHienTai) return "active";
      if (viTriTram === tramHienTai + 1) return "between";
      if (viTriTram < tramHienTai) return "passed";
      return "normal";
    }
  }, []);

  // Hàm định dạng thời gian
  const dinhDangThoiGian = (ngayGio) => {
    if (!(ngayGio instanceof Date) || isNaN(ngayGio.getTime())) return "-";
    const themSo0 = (so) => (so < 10 ? "0" + so : so);
    return `${themSo0(ngayGio.getHours())}:${themSo0(ngayGio.getMinutes())}:${themSo0(ngayGio.getSeconds())}`;
  };

  const dinhDangLanCapNhat = () => {
    if (!lanCapNhatCuoi) return "";
    return `Cập nhật: ${lanCapNhatCuoi.toLocaleTimeString()}`;
  };

  return ( 
    <div className="tracking-container"> 
      <div className="main-content"> 
        <div className="body">
          {/* Bản đồ */}
          <div className="map">
            <MapComponent
              searchQuery={tuKhoaTim}
              searchTrigger={lanKichHoatTim}
              onRouteSelect={xuLyChonTuyen}
            />
          </div>

          {/* Thanh bên hiển thị thông tin */}
          <div className="panel">
            {/* Ô tìm kiếm */}
            <div className="search-filter">
              <div className="search-row">
                <input
                  type="text"
                  placeholder="Nhập mã xe buýt"
                  className="search-input"
                  value={tuKhoaTim}
                  onChange={(e) => setTuKhoaTim(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      xuLyTimKiem();
                    }
                  }}
                />

                <select className="filter-select">
                  <option value="xe-bus">Xe buýt</option>
                </select>
              </div>

              <button className="search-btn" onClick={xuLyTimKiem}>
                Tìm kiếm
              </button>
            </div>

            {/* Hiển thị tiến trình tuyến đường */}
            {tuyenDuongChon ? (
              <div className="stops-progress">
                <div className="route-header">
                  <h3 className="progress-title">
                    Tuyến: {tuyenDuongChon.routeId}
                  </h3>
                  <div className="last-update">{dinhDangLanCapNhat()}</div>
                </div>

                {/* Thông tin chi tiết */}
                <div className="bus-info">
                  <div className="info-item">
                    <span>Trạng thái xe:</span>
                    <strong>
                      {tuyenDuongChon.status === 'waiting' 
                        ? "Chờ khởi hành" 
                        : tuyenDuongChon.status === 'finished'
                          ? "Đã kết thúc"
                          : "Đang hoạt động"}
                    </strong>
                  </div>
                  <div className="info-item">
                    <span>Mã tài xế:</span>
                    <strong>{tuyenDuongChon.busInfo?.driver_id || "Không lấy được dữ liệu"}</strong>
                  </div>
                  <div className="info-item">
                    <span>Mã tuyến:</span>
                    <strong>{tuyenDuongChon.routeId}</strong>
                  </div>
                  <div className="info-item">
                    <span>Ngày khởi hành:</span>
                    <strong>{tuyenDuongChon.busInfo?.schedule_date ? new Date(tuyenDuongChon.busInfo.schedule_date).toLocaleDateString('vi-VN') : 'Không lấy được dữ liệu'}</strong>
                  </div>
                  <div className="info-item">
                    <span>Giờ khởi hành:</span>
                    <strong>{tuyenDuongChon.busInfo?.start_time || 'Không lấy được dữ liệu'}</strong>
                  </div>
                  <div className="info-item">
                    <span>Giờ dự kiến:</span>
                    <strong>{tuyenDuongChon.gioDuKienKT ? dinhDangThoiGian(tuyenDuongChon.gioDuKienKT) : 'Không lấy được dữ liệu'}</strong>
                  </div>
                  
                  {/* QUÃNG ĐƯỜNG ĐÃ ĐI */} 
                  {/* ~ 0.01126 km ≈ 0.01 km  */} 
                  <div className="info-item">
                    <span>Quãng đường đã đi:</span>
                    <div className="distance-display">
                      <strong className="distance-m">{tuyenDuongChon.distanceTraveled.toFixed(6)} m</strong>
                      <span className="distance-separator"> = </span>
                      <strong className="distance-km">{(tuyenDuongChon.distanceTraveled / 1000).toFixed(2)} km</strong>
                    </div>
                  </div>

                  {/* VẬN TỐC */}
                  <div className="info-item">
                    <span>Vận tốc:</span>
                    <div className="speed-display">
                      <strong className="speed-kmh">{tuyenDuongChon.vanToc} km/h</strong>
                    </div>
                  </div>

                  <div className="info-item">
                    <span>Tổng khoảng cách:</span>
                    <strong>{(tuyenDuongChon.totalDistance / 1000).toFixed(2)} km</strong>
                  </div>

                </div>

                {/* Tiến trình các trạm */}
                <div className="progress-track">
                  {tuyenDuongChon.stops.map((tram, viTri) => {
                    const trangThai = xacDinhTrangThaiTram(
                      viTri, 
                      tuyenDuongChon.currentStopIndex, 
                      tuyenDuongChon.status
                    );
                    
                    const laDuongNoiActive = 
                      tuyenDuongChon.status === 'moving' && 
                      viTri === tuyenDuongChon.currentStopIndex;

                    return (
                      <div key={viTri} className={`stop-item ${trangThai}`}>
                        {viTri < tuyenDuongChon.stops.length - 1 && (
                          <div
                            className={`connection-line ${
                              laDuongNoiActive ? "active-line" : ""
                            }`}
                          ></div>
                        )}

                        <div className="stop-content">
                          <div className={`stop-marker ${trangThai}`}>
                            {trangThai.includes("active") && <div className="pulse-animation"></div>}
                          </div>
                          <div className="stop-info">
                            <div className="stop-name">{tram.stop_name}</div>
                            <div className="stop-order">
                              Trạm {viTri + 1}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="no-route-selected">
                <p>{tuKhoaTim ? "Không tìm thấy xe phù hợp" : "Vui lòng tìm xe để xem lộ trình"}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Tracking;