import L from 'leaflet';
import { iconXe, iconTram, VAN_TOC } from './constants.js';
import { formatTime } from './handleDateTime.js';

/**
 * Tạo hoặc cập nhật marker xe trên bản đồ
 */
export const capNhatMarkerXe = (idTuyen, viTri, lichTrinh, trangThai, mapRef, markerXeRef, dataTuyenRef) => {
  if (!mapRef.current || !viTri || !lichTrinh) return null;

  let marker = markerXeRef.current[idTuyen];
  
  // Tạo marker mới nếu chưa có
  if (!marker) {
    marker = L.marker(viTri, {
      icon: iconXe,
      opacity: trangThai.opacity
    }).addTo(mapRef.current).bindTooltip("", { sticky: true });
    markerXeRef.current[idTuyen] = marker;
  }

  const dataTuyen = dataTuyenRef.current[idTuyen];
  
  // Tạo nội dung tooltip theo trạng thái
  let tooltipContent = "";

  if (trangThai.status === 'inactive' || trangThai.status === 'finished') {
    // Tooltip inactive - chỉ hiển thị 4 thông tin
    tooltipContent = `
      <b>Mã xe: ${lichTrinh.bus_id || 'Lỗi'}</b><br/>
      <b>Mã tài xế: ${lichTrinh.driver_id || 'Lỗi'}</b><br/>
      <b>Mã tuyến: ${idTuyen}</b><br/>
      <b>Trạng thái:</b> ${trangThai.desc}
    `;
  } else {
    // Tooltip active - hiển thị đầy đủ thông tin
    const thoiGianKetThuc = dataTuyen ? 
      new Date(dataTuyen.thoiGianBatDau.getTime() + (dataTuyen.tongS / (VAN_TOC * 1000 / 3600) * 1000)) : 
      null;

    tooltipContent = `
      <b>Mã xe: ${lichTrinh.bus_id || 'Lỗi'}</b><br/>
      <b>Mã tài xế: ${lichTrinh.driver_id || 'Lỗi'}</b><br/>
      <b>Mã tuyến: ${idTuyen}</b><br/>
      <b>Ngày khởi hành:</b> ${lichTrinh.schedule_date ? new Date(lichTrinh.schedule_date).toLocaleDateString('vi-VN') : 'Lỗi'}<br/>
      <b>Trạng thái:</b> ${trangThai.desc}<br/>
      <b>Khởi hành:</b> ${lichTrinh.start_time || 'Lỗi'}<br/>
      <b>Đến dự kiến:</b> ${thoiGianKetThuc ? formatTime(thoiGianKetThuc) : 'Đang tính...'}<br/>
      <b>Vận tốc:</b> ${VAN_TOC} km/h<br/>
      <b>Khoảng cách thực:</b> ${dataTuyen ? (dataTuyen.tongS / 1000).toFixed(2) + ' km' : 'Đang tính...'}
    `;
  }

  // Cập nhật tooltip và vị trí marker
  marker.getTooltip().setContent(tooltipContent);
  marker.setOpacity(trangThai.opacity);
  marker.setLatLng(viTri);
  
  return marker;
};

/**
 * Tạo marker cho các trạm xe
 */
export const taoMarkerTram = (idTuyen, dsTram, map, markerTramRef) => {
  if (!dsTram || !Array.isArray(dsTram)) return;

  markerTramRef.current[idTuyen] = dsTram.map((tram, idx) => {
    if (!tram.lat || !tram.lng) return null;

    // Dịch chuyển một chút để các marker không chồng lên nhau
    const offset = idx * 0.00003;
    const marker = L.marker([tram.lat + offset, tram.lng + offset], { 
      icon: iconTram,
      title: `${tram.stop_name} (${idx + 1}/${dsTram.length})`
    }).addTo(map);
    
    // Thêm tooltip hiển thị tên trạm
    marker.bindTooltip(`
      <b>${tram.stop_name}</b><br/>
      <i>Thứ tự: ${idx + 1}/${dsTram.length}</i>
    `, { sticky: true });
    
    return { tram, marker, idx };
  }).filter(Boolean); // Lọc bỏ các marker null
};