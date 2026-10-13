import { VAN_TOC } from './constants.js';
import { capNhatTrangThaiTram } from './handleRouteCalculation.js';

/**
 * Xử lý tìm kiếm xe theo từ khóa
 */
export const xuLyTimKiem = (searchQuery, mapRef, markerXeRef, isTheoDoiRef, markerTheoDoiRef, selectedRouteIdRef, onRouteSelectRef, dataTuyenRef) => {
  if (!searchQuery) {
    // Reset nếu không có query
    isTheoDoiRef.current = false;
    markerTheoDoiRef.current = null;
    selectedRouteIdRef.current = null;
    if (onRouteSelectRef.current) onRouteSelectRef.current(null);
    return;
  }

  const query = searchQuery.trim().toLowerCase();
  let found = false;

  // Duyệt qua tất cả marker xe để tìm kiếm
  for (const idTuyen in markerXeRef.current) {
    const marker = markerXeRef.current[idTuyen];
    if (!marker || !marker.getTooltip) continue;

    const tooltipText = marker.getTooltip().getContent()?.toLowerCase() || "";
    if (tooltipText.includes(query)) {
      // Nếu đang theo dõi marker này thì tắt, ngược lại thì bật theo dõi
      if (markerTheoDoiRef.current === marker && selectedRouteIdRef.current === idTuyen) {
        isTheoDoiRef.current = false;
        markerTheoDoiRef.current = null;
        selectedRouteIdRef.current = null;
        if (onRouteSelectRef.current) onRouteSelectRef.current(null);
      } else {
        markerTheoDoiRef.current = marker;
        isTheoDoiRef.current = true;
        mapRef.current.setView(marker.getLatLng(), 17); // Zoom vào xe
        marker.openTooltip();
        selectedRouteIdRef.current = idTuyen;
        capNhatThongTinTuyen(idTuyen, dataTuyenRef, selectedRouteIdRef, onRouteSelectRef);
      }
      found = true;
      break;
    }
  }

  // Nếu không tìm thấy, reset trạng thái
  if (!found) {
    isTheoDoiRef.current = false;
    markerTheoDoiRef.current = null;
    selectedRouteIdRef.current = null;
    if (onRouteSelectRef.current) onRouteSelectRef.current(null);
  }
};

/**
 * Cập nhật thông tin tuyến cho component cha
 */
export const capNhatThongTinTuyen = (idTuyen, dataTuyenRef, selectedRouteIdRef, onRouteSelectRef) => {
  const dataTuyen = dataTuyenRef.current[idTuyen];
  if (!dataTuyen || !onRouteSelectRef.current) return;

  const now = new Date();
  let currentStopIndex = -1;
  let distanceTraveled = 0;
  let status = 'waiting';

  // Tính toán trạng thái hiện tại
  if (dataTuyen.thoiGianBatDau <= now) {
    const thoiGianHoatDong = (now - dataTuyen.thoiGianBatDau) / 1000;
    distanceTraveled = Math.min(thoiGianHoatDong * (VAN_TOC * 1000 / 3600), dataTuyen.tongS);
    
    if (distanceTraveled >= dataTuyen.tongS) {
      status = 'finished';
      currentStopIndex = dataTuyen.dsTram.length - 1;
    } else {
      status = 'moving';
      // Tìm trạm hiện tại
      for (let i = 0; i < dataTuyen.kcTram.length; i++) {
        if (distanceTraveled >= dataTuyen.kcTram[i].kcDenTram) {
          currentStopIndex = i;
        } else {
          break;
        }
      }
    }
  } else {
    status = 'waiting';
    currentStopIndex = 0;
  }

  // Gọi callback với thông tin cập nhật
  onRouteSelectRef.current({
    routeId: idTuyen,
    stops: dataTuyen.dsTram || [],
    currentStopIndex: currentStopIndex,
    nextStopIndex: currentStopIndex + 1 < dataTuyen.dsTram.length ? currentStopIndex + 1 : -1,
    distanceTraveled: distanceTraveled,
    estimatedTime: new Date(),
    busInfo: dataTuyen.lichTrinh,
    status: status,
    totalDistance: dataTuyen.tongS,
    vanToc: VAN_TOC,
    gioDuKienKT: new Date(dataTuyen.thoiGianBatDau.getTime() + (dataTuyen.tongS / (VAN_TOC * 1000 / 3600) * 1000))
  });
};