import React, { useState, useEffect } from "react";
import axios from "axios";
import "./App.css";
import "./Admin.css";
import Info from "./Info";
import Tracking from "./Tracking";
import StudentManagementPage from "./pages/maincontent/Student_management/StudentManagementPage";
import RouteManagementPage from "./pages/maincontent/Route_management/RouteManagementPage"
import QuanLyTaiXe from "./frontend/QuanLyTaiXe";
import QuanLyXeBuyt from "./frontend/QuanLyXeBuyt";
import ThongBao from "./frontend/ThongBao";
import Clock from "./components/Time";
import DemoTk from "./demoTk";

function Admin({ user, onLogout }) {
  const [showModal, setShowModal] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [modalValue, setModalValue] = useState("");
  const [activePage, setActivePage] = useState("TRANG CHỦ");
  const [showDropdown, setShowDropdown] = useState(false); // dropdown logout

  const [statsData, setStatsData] = useState({
    xeBuyt: 0,
    taiXe: 0,
    hocSinh: 0,
    tuyenDuong: 0,
  });

  // Fetch thống kê
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/thongke");
        setStatsData(res.data);
      } catch (err) {
        console.error("Error fetching stats:", err);
      }
    };
    fetchStats();
  }, []);

  const handleCardClick = (title, value) => {
    setModalTitle(title);
    setModalValue(value);
    setShowModal(true);
  };

  return (
    <div className="container">
      {/* Sidebar */}
      <div className="sidebar">
        <h2>SBT</h2>
        <ul>
          <li onClick={() => setActivePage("TRANG CHỦ")}>Trang chủ</li>
          <li onClick={() => setActivePage("THEO DÕI XE BUÝT")}>Theo dõi xe buýt</li>
          <li onClick={() => setActivePage("QUẢN LÝ TÀI XẾ")}>Quản lý tài xế</li>
          <li onClick={() => setActivePage("QUẢN LÝ HỌC SINH")}>Quản ly học sinh</li>
          <li onClick={() => setActivePage("QUẢN LÝ TUYẾN ĐƯỜNG")}>Quản lý tuyến đường</li>
          <li onClick={() => setActivePage("QUẢN LÝ XE BUÝT")}>Quản lý xe buýt</li>
          <li onClick={() => setActivePage("QUẢN LÝ THÔNG BÁO")}>Quản lý thông báo</li>
        </ul>
        {/* Không còn nút logout ở sidebar */}
      </div>

      {/* Main */}
      <div className="main">
        {/* Header */}
        <div
          className="header"
        >
          <h1>{activePage.toUpperCase()}</h1>

          {/* Profile */}
          <div style={{ display: "flex", alignItems: "center", gap: "10px", position: "relative" }}>
            <Clock />

            {/* Avatar + tên user + dropdown */}
            <div
              style={{ display: "flex", alignItems: "center", gap: "5px", cursor: "pointer" }}
              onClick={() => setShowDropdown((prev) => !prev)}
            >
              <div
                style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "50%",
                  backgroundColor: "white",
                  border: "2px solid #fff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <img
                  src="/img/ADMIN.png"
                  alt="Admin"
                  style={{
                    width: "30px",
                    height: "30px",
                    borderRadius: "50%",
                    objectFit: "cover",
                  }}
                />
              </div>
              <span style={{ fontWeight: "bold" }}>▼</span>
            </div>

            {/* Dropdown menu */}
            {showDropdown && (
              <div
                style={{
                  position: "absolute",
                  top: "60px",
                  right: "0",
                  backgroundColor: "white",
                  color: "black",
                  boxShadow: "0 4px 8px rgba(0,0,0,0.2)",
                  borderRadius: "5px",
                  padding: "10px",
                  zIndex: 100,
                  minWidth: "150px",
                }}
              >
                <div style={{ marginBottom: "10px", fontWeight: "bold", textAlign: "center" }}>
                  {user.username.toUpperCase()}
                </div>
                <button
                  onClick={onLogout}
                  style={{
                    width: "100%",
                    padding: "8px",
                    backgroundColor: "red",
                    color: "white",
                    border: "none",
                    borderRadius: "5px",
                    cursor: "pointer",
                  }}
                >
                  Đăng xuất
                </button>
              </div>
            )}
          </div>
        </div>

        {/* === TRANG CHỦ === */}
        {activePage === "TRANG CHỦ" && (
          <>
            <div className="stats">
              <div className="item" onClick={() => handleCardClick("Xe Buýt", statsData.xeBuyt)}>
                <b>{statsData.xeBuyt}</b>
                <span>Xe Buýt</span>
              </div>

              <div className="item" onClick={() => handleCardClick("Tài Xế", statsData.taiXe)}>
                <b>{statsData.taiXe}</b>
                <span>Tài Xế</span>
              </div>

              <div className="item" onClick={() => handleCardClick("Học Sinh", statsData.hocSinh)}>
                <b>{statsData.hocSinh}</b>
                <span>Học Sinh</span>
              </div>

              <div className="item" onClick={() => handleCardClick("Tuyến Đường", statsData.tuyenDuong)}>
                <b>{statsData.tuyenDuong}</b>
                <span>Tuyến Đường</span>
              </div>
            </div>

            <Info show={showModal} onClose={() => setShowModal(false)} title={modalTitle} value={modalValue} />

            <div className="thongbao">
              <DemoTk />
            </div>
          </>
        )}

        {/* === THEO DÕI XE BUÝT === */}
        {activePage === "THEO DÕI XE BUÝT" && <Tracking />}

        {/* === QUẢN LÝ HỌC SINH === */}
        {activePage === "QUẢN LÝ TUYẾN ĐƯỜNG" && <RouteManagementPage />}

        {/* === QUẢN LÝ HỌC SINH === */}
        {activePage === "QUẢN LÝ HỌC SINH" && <StudentManagementPage />}

        {/* === QUẢN LÝ TÀI XẾ === */}
        {activePage === "QUẢN LÝ TÀI XẾ" && <QuanLyTaiXe />}
        
        {/* === QUẢN LÝ XE BUÝT=== */}
        {activePage === "QUẢN LÝ XE BUÝT" && <QuanLyXeBuyt />}

        {/* === QUẢN LÝ THÔNG BÁO === */}
        {activePage === "QUẢN LÝ THÔNG BÁO" && <ThongBao />}
      </div>
    </div>
  );
}

export default Admin;