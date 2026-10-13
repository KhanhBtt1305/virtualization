import React, { useState, useEffect } from "react"; 
import "./QuanLyTaiXe.css";
import NextWeekScheduler from "./NextWeekScheduler";

// === 🔹 NHẬP CÁC COMPONENT TỪ FILE RIÊNG ===
import DriverFormPopup from "./components/DriverFormPopup";
import DriverViewPopup from "./components/DriverViewPopup";
import DriverEditPopup from "./components/DriverEditPopup";
import ScheduleCalendarPopup from "./components/ScheduleCalendarPopup";
// ===========================================

export default function QuanLyTaiXe() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("Tất cả");
  const [showPopup, setShowPopup] = useState(false);
  const [showDriverSchedulePopup, setShowDriverSchedulePopup] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [showDriverAddPopup, setShowDriverAddPopup] = useState(false); 
  const [showDriverViewPopup, setShowDriverViewPopup] = useState(false);
  const [viewPopupData, setViewPopupData] = useState(null);
  const [showDriverEditPopup, setShowDriverEditPopup] = useState(false);
  const [selectedDriverId, setSelectedDriverId] = useState(null); 
  const [showScheduler, setShowScheduler] = useState(false);

  const [drivers, setDrivers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    setIsLoading(true);
    fetch('http://localhost:5000/api/drivers')
      .then(res => {
        if (!res.ok) throw new Error('Không thể tải dữ liệu');
        return res.json();
      })
      .then(data => {
        setDrivers(data);
        setIsLoading(false);
      })
      .catch(err => {
        console.error("Lỗi khi fetch drivers:", err);
        alert("Không thể tải danh sách tài xế từ server.");
        setIsLoading(false);
      });
  }, []); 


  const handleShowDriverSchedule = (driver) => {
    setSelectedDriver(driver);
    setShowDriverSchedulePopup(true);
  };
  const handleCloseDriverSchedule = () => {
    setShowDriverSchedulePopup(false);
    setSelectedDriver(null);
  };
  const handleAddDriver = () => {
    setShowDriverAddPopup(true); 
  };
  const handleCloseAddPopup = () => {
    setShowDriverAddPopup(false);
  }
  const handleEditDriver = () => {
    setShowDriverEditPopup(true);
  };
  const handleCloseEditPopup = () => {
    setShowDriverEditPopup(false);
  }
  const handleRowClick = (driver) => {
    setSelectedDriverId(driver.id); 
    setViewPopupData(driver);       
    setShowDriverViewPopup(true); 
  };
  const handleCloseViewPopup = () => {
    setShowDriverViewPopup(false);
  }

  const handleAddDriverToList = (newDriver) => {
    setDrivers(prevDrivers => [...prevDrivers, newDriver]);
  };
  
  const handleUpdateDriverInList = (updatedDriver) => {
    setDrivers(prevDrivers => prevDrivers.map(driver => {
        if (driver.id === updatedDriver.id) {
          return { ...driver, ...updatedDriver }; 
        }
        return driver;
      })
    );
  };

  const handleDeleteDriverFromList = (driverId) => {
     setDrivers(prevDrivers => prevDrivers.filter(driver => driver.id !== driverId));
  };

  const filtered = drivers.filter((d) =>
    Object.values(d).some((value) =>
      String(value).toLowerCase().includes(searchTerm.toLowerCase())
    ) && (filterStatus === "Tất cả" || d.status === filterStatus)
  );


  return (
    // Đã xóa dashboard, sidebar, header
    <div className="driver-container" style={{padding: "10px", height: "100%", display: "flex", flexDirection: "column"}}>
          <div className="toolbar">
            <input
              type="text"
              placeholder="Tìm kiếm tài xế..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
              <option value="Tất cả">Tất cả</option>
              <option value="Đang hoạt động">Đang hoạt động</option>
              <option value="Rảnh">Rảnh</option>
              <option value="Nghỉ phép">Nghỉ phép</option>
            </select>
            
            <button className="btn-edit" onClick={handleEditDriver}>Chỉnh sửa</button>
            <button className="btn-add" onClick={handleAddDriver}>+ Thêm tài xế</button>
            
            <button className="btn-schedule" onClick={() => setShowPopup(true)}>📅 Lịch đăng ký</button>
            <button className="btn-match" onClick={() => setShowScheduler(true)}>Gán tài xế</button>
          </div>

          <table className="driver-table">
            <thead>
              <tr>
                <th>Mã</th>
                <th>Họ tên</th>
                <th>SĐT</th>
                <th>Địa chỉ</th>
                <th>Số chuyến/tuần</th>
                <th>Trạng thái</th>
                <th>Lịch</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan="7" style={{textAlign: "center"}}>Đang tải dữ liệu...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan="7" style={{textAlign: "center"}}>Không tìm thấy tài xế.</td></tr>
              ) : (
                filtered.map((d) => (
                  <tr 
                    key={d.id}
                    className={selectedDriverId === d.id ? "row-selected" : ""}
                    onClick={() => handleRowClick(d)}
                  >
                    <td>{d.id}</td>
                    <td>{d.name}</td>
                    <td>{d.phone}</td>
                    <td>{d.address}</td>
                    <td>{d.weeklyTrips}</td>
                    <td>
                      <span className={`status-badge ${d.status === "Đang hoạt động"
                        ? "active"
                        : d.status === "Rảnh"
                          ? "idle"
                          : "off"
                        }`}>
                        {d.status}
                      </span>
                    </td>
                    <td>
                      <button
                        className="calendar-btn"
                        onClick={(e) => {
                          e.stopPropagation(); 
                          handleShowDriverSchedule(d);
                        }}
                      >
                        📅
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

        {/* --- DANH SÁCH 4 POPUP --- */}

        {/* 1. Popup Lịch Chung */}
        <ScheduleCalendarPopup
          isOpen={showPopup}
          onClose={() => setShowPopup(false)}
          title="Lịch đăng ký tài xế (Chung)"
          driver={null} 
          drivers={drivers} 
          showWeekTab={true}
          defaultTab="month"
        />
        {/* 2. Popup Lịch Riêng */}
        <ScheduleCalendarPopup
          isOpen={showDriverSchedulePopup}
          onClose={handleCloseDriverSchedule}
          title={`Lịch đăng ký: ${selectedDriver?.name || ''}`}
          driver={selectedDriver} 
          drivers={drivers}
          showWeekTab={true}
          defaultTab="month"
        />
        
        {/* (Các popup Thêm/Sửa/Xem) */}
        <DriverFormPopup
          isOpen={showDriverAddPopup}
          onClose={handleCloseAddPopup}
          onAddDriver={handleAddDriverToList}
        />
        <DriverViewPopup
          isOpen={showDriverViewPopup}
          onClose={handleCloseViewPopup}
          driverData={viewPopupData}
        />
        <DriverEditPopup
          isOpen={showDriverEditPopup}
          onClose={handleCloseEditPopup}
          drivers={drivers} 
          onUpdateDriver={handleUpdateDriverInList}
          onDeleteDriver={handleDeleteDriverFromList}
        />
        
        {/* 3. Popup Gán Tài Xế */}
        <NextWeekScheduler
          isOpen={showScheduler}
          onClose={() => setShowScheduler(false)}
          drivers={drivers}
        />
    </div>
  );
}