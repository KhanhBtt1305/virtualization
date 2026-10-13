import L from 'leaflet';
import { VAN_TOC } from './constants.js';
import { taoMarkerTram } from './handleMarkers.js';
import { tinhKCdenTram } from './handleRouteCalculation.js';
import { parseDateTime } from './handleDateTime.js';
import { layTrangThaiXe } from './handleRouteCalculation.js';
import { capNhatMarkerXe } from './handleMarkers.js';
import { batDauDemNguoc, batDauDiChuyenXe, danhDauXeKetThuc } from './handleAnimation.js';
import { capNhatTrangThaiTram } from './handleRouteCalculation.js';

/**
 * Khởi tạo bản đồ Leaflet map/
 */
export const khoiTaoBanDo = (centerLat, centerLng, mapRef, isTheoDoiRef, markerTheoDoiRef) => {
  if (!mapRef.current) {
    // Tạo bản đồ mới
    mapRef.current = L.map("map", {
      center: [centerLat, centerLng],
      zoom: 16,
      minZoom: 1,
      maxZoom: 19,
      scrollWheelZoom: true,
    });

    // Thêm tile layer (nền bản đồ)
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(mapRef.current);

    // Tắt chế độ theo dõi khi click vào bản đồ
    mapRef.current.on("click", () => {
      isTheoDoiRef.current = false;
      markerTheoDoiRef.current = null;
    });
  }
  return mapRef.current;
};

/**
 * Xử lý sự kiện cho polyline tuyến đường
 */
export const xuLySuKienPolyline = (duongDi, tuyen, tongS, dsTram) => {
  // Thêm tooltip cho tuyến đường
  duongDi.bindTooltip(
    `<b>Tên tuyến: ${tuyen.route_name}</b><br/>Số trạm: ${dsTram.length}<br/>Khoảng cách: ${(tongS / 1000).toFixed(2)} km`, 
    { 
      sticky: true,
      direction: 'top'
    }
  );

  // Hiệu ứng khi hover
  duongDi.on("mouseover", function(e) {
    this.setStyle({ color: "red", weight: 10, opacity: 0.9 });
    this.bringToFront();
    if (!this.isTooltipOpen) {
      this.openTooltip(e.latlng);
      this.isTooltipOpen = true;
    }
  });

  duongDi.on("mouseout", function(e) {
    this.setStyle({ color: "#007bff", weight: 6, opacity: 1 });
    if (this.isTooltipOpen) {
      this.closeTooltip();
      this.isTooltipOpen = false;
    }
  });

  duongDi.on("click", function(e) {
    this.openTooltip(e.latlng);
    this.isTooltipOpen = true;
  });
};

/**
 * Thiết lập toàn bộ tuyến đường trên bản đồ
 */
export const thietLapTuyen = (tuyen, map, dataTuyenRef, markerXeRef, markerTramRef, controlTuyenRef, polylineRef, animRefs, selectedRouteIdRef, onRouteSelectRef, mapRef, isTheoDoiRef, markerTheoDoiRef) => {
  if (!tuyen.stops || !Array.isArray(tuyen.stops) || tuyen.stops.length === 0) return;

  // Sắp xếp các trạm theo thứ tự
  const dsTram = tuyen.stops.slice().sort((a, b) => a.stop_order - b.stop_order);
  taoMarkerTram(tuyen.route_id, dsTram, map, markerTramRef);

  // Tạo waypoints cho routing
  const waypoints = dsTram.map(tram => L.latLng(tram.lat, tram.lng));

  // Sử dụng Leaflet Routing Machine để tính đường đi
  const routingControl = L.Routing.control({
    waypoints,
    routeWhileDragging: false,
    draggableWaypoints: false,
    addWaypoints: false,
    showAlternatives: false,
    createMarker: () => null, // Không tạo marker tự động
    lineOptions: { 
      styles: [{ color: "#007bff", weight: 6, opacity: 1 }] 
    },
    show: false, // Ẩn control panel
    router: L.Routing.osrmv1({ 
      serviceUrl: "https://router.project-osrm.org/route/v1" 
    }),
  }).addTo(map);

  controlTuyenRef.current[tuyen.route_id] = routingControl;

  // Xử lý khi tìm thấy route
  routingControl.on("routesfound", (event) => {
    const route = event.routes[0];
    const tongS = route.summary.totalDistance;
    const toaDoDoans = route.coordinates.map(coord => L.latLng(coord.lat, coord.lng));

    // Vẽ polyline tuyến đường
    const duongDi = L.polyline(toaDoDoans, {
      color: "#007bff",
      weight: 6,
      opacity: 1,
      interactive: true
    }).addTo(map);

    polylineRef.current[tuyen.route_id] = duongDi;
    xuLySuKienPolyline(duongDi, tuyen , tongS, dsTram);

    // Tính khoảng cách đến các trạm
    const kcTram = tinhKCdenTram(toaDoDoans, dsTram);
    const lichTrinh = tuyen.schedule[0];
    const thoiGianBatDau = parseDateTime(lichTrinh.schedule_date, lichTrinh.start_time);

    // Lưu dữ liệu tuyến vào ref
    dataTuyenRef.current[tuyen.route_id] = {
      toaDoDoans,
      thoiGianBatDau,
      tongS,
      kcTram,
      lichTrinh,
      dsTram,
      thoiGianKetThuc: thoiGianBatDau ? new Date(thoiGianBatDau.getTime() + (tongS / (VAN_TOC * 1000 / 3600) * 1000)) : null
    };

    // Tạo marker xe và bắt đầu animation
    const trangThai = layTrangThaiXe(lichTrinh, thoiGianBatDau, dataTuyenRef);
    const marker = capNhatMarkerXe(tuyen.route_id, toaDoDoans[0], lichTrinh, trangThai, mapRef, markerXeRef, dataTuyenRef);

    if (!marker) return;

    // Bắt đầu animation tùy theo trạng thái
    if (trangThai.status === 'waiting') {
      batDauDemNguoc(
        tuyen.route_id, 
        dataTuyenRef, 
        markerXeRef, 
        animRefs, 
        selectedRouteIdRef, 
        onRouteSelectRef,
        mapRef,
        isTheoDoiRef,
        markerTheoDoiRef
      );
    } else if (trangThai.status === 'active') {
      batDauDiChuyenXe(
        tuyen.route_id, 
        dataTuyenRef, 
        markerXeRef, 
        animRefs, 
        selectedRouteIdRef, 
        onRouteSelectRef, 
        mapRef, 
        isTheoDoiRef, 
        markerTheoDoiRef
      );
    } else if (trangThai.status === 'finished') {
      capNhatTrangThaiTram(tuyen.route_id, tongS, 'finished', dataTuyenRef, selectedRouteIdRef, onRouteSelectRef);
      danhDauXeKetThuc(tuyen.route_id, lichTrinh, markerXeRef, dataTuyenRef);
    }

    // Xóa routing control sau 1 giây
    setTimeout(() => {
      if (controlTuyenRef.current[tuyen.route_id]) {
        map.removeControl(controlTuyenRef.current[tuyen.route_id]);
        controlTuyenRef.current[tuyen.route_id] = null;
      }
    }, 1000);
  });

  // Xử lý lỗi routing
  routingControl.on('routingerror', (error) => {
    console.error(`Lỗi routing cho tuyến ${tuyen.route_id}:`, error);
    if (controlTuyenRef.current[tuyen.route_id]) {
      map.removeControl(controlTuyenRef.current[tuyen.route_id]);
      controlTuyenRef.current[tuyen.route_id] = null;
    }
  });
};