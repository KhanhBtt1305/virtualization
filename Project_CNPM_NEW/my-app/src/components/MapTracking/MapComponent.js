import React, { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-routing-machine/dist/leaflet-routing-machine.css";
import "leaflet-routing-machine";
import axios from "axios";

// Import các hàm
import { khoiTaoBanDo, thietLapTuyen } from './handleMapSetup.js';
import { xuLyTimKiem, capNhatThongTinTuyen } from './handleSearch.js';

function MapComponent({ searchQuery, searchTrigger, onRouteSelect }) {
  // ================ KHAI BÁO STATE VÀ REF ================
  
  // lưu danh sách tuyến đường
  const [dsTuyen, setDsTuyen] = useState([]);
  
  // Refs cho bản đồ và các thành phần
  const mapRef = useRef(null);                    // Tham chiếu đến bản đồ Leaflet
  const markerXeRef = useRef({});                 // Lưu các marker xe theo id tuyến
  const markerTramRef = useRef({});               // Lưu các marker trạm theo id tuyến
  const controlTuyenRef = useRef({});             // Lưu các control routing theo id tuyến
  const dataTuyenRef = useRef({});                // Lưu dữ liệu tuyến đường theo id tuyến
  const animRefs = useRef({});                    // Lưu các interval/timeout animation
  const polylineRef = useRef({});                 // Lưu các polyline tuyến đường
  
  // Refs cho chức năng theo dõi và callback
  const markerTheoDoiRef = useRef(null);          // Marker đang được theo dõi
  const isTheoDoiRef = useRef(false);             // Có đang theo dõi xe nào không
  const selectedRouteIdRef = useRef(null);        // ID tuyến đang được chọn
  const onRouteSelectRef = useRef(onRouteSelect); // Ref cho callback

  // Cập nhật ref khi prop thay đổi
  useEffect(() => {
    onRouteSelectRef.current = onRouteSelect;
  }, [onRouteSelect]);

  // ================ CÁC EFFECTS ================

  // Lấy danh sách tuyến đường từ API
  useEffect(() => {
    let isCancelled = false;
    const layDsTuyen = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/vehicle/routes");
        if (!isCancelled) setDsTuyen(response.data);
      } catch (error) {
        console.error("Lỗi khi lấy danh sách tuyến đường:", error);
      }
    };
    layDsTuyen();
    return () => { isCancelled = true; }; // Cleanup khi component unmount
  }, []);

  // Khởi tạo bản đồ và vẽ các tuyến đường khi có dữ liệu
  useEffect(() => {
    if (dsTuyen.length === 0) return;

    // Tính tọa độ trung bình để đặt trung tâm bản đồ
    const allTram = dsTuyen.flatMap(tuyen => tuyen.stops || []);
    if (allTram.length === 0) return;

    const centerLat = allTram.reduce((sum, tram) => sum + tram.lat, 0) / allTram.length;
    const centerLng = allTram.reduce((sum, tram) => sum + tram.lng, 0) / allTram.length;

    const map = khoiTaoBanDo(centerLat, centerLng, mapRef, isTheoDoiRef, markerTheoDoiRef);

    // Xóa tất cả layer cũ (marker, polyline, routing)
    map.eachLayer((layer) => {
      if (layer instanceof L.Marker || layer instanceof L.Polyline || 
          (layer._container && layer._container.classList && layer._container.classList.contains('leaflet-routing-container'))) {
        map.removeLayer(layer);
      }
    });

    // Reset tất cả refs
    markerXeRef.current = {};
    markerTramRef.current = {};
    controlTuyenRef.current = {};
    dataTuyenRef.current = {};
    animRefs.current = {};
    polylineRef.current = {};
    selectedRouteIdRef.current = null;

    // Thiết lập từng tuyến đường
    dsTuyen.forEach(tuyen => {
      if (!tuyen.schedule || tuyen.schedule.length === 0) return;
      thietLapTuyen(tuyen, map, dataTuyenRef, markerXeRef, markerTramRef, controlTuyenRef, polylineRef, animRefs, selectedRouteIdRef, onRouteSelectRef, mapRef, isTheoDoiRef, markerTheoDoiRef);
    });
  }, [dsTuyen]);

  // Xử lý tìm kiếm khi searchTrigger thay đổi
  useEffect(() => {
    xuLyTimKiem(searchQuery, mapRef, markerXeRef, isTheoDoiRef, markerTheoDoiRef, selectedRouteIdRef, onRouteSelectRef, dataTuyenRef);
  }, [searchTrigger]);

  // Cleanup khi component unmount
  useEffect(() => {
    return () => {
  // Dọn dẹp tất cả interval và timeout
      Object.values(animRefs.current).forEach(anim => {
        if (anim?.demNguoc) clearInterval(anim.demNguoc);
        if (anim?.animation) clearTimeout(anim.animation);
      });
    };
  }, []);

  // ================ RENDER ================
  return <div id="map" style={{ width: "100%", height: "100%" }} />;
}

export default MapComponent;