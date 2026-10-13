import { VAN_TOC } from './constants.js';
import { formatTime } from './handleDateTime.js';
import { timViTriXe } from './handleRouteCalculation.js';
import { capNhatTrangThaiTram } from './handleRouteCalculation.js';
import { capNhatMarkerXe } from './handleMarkers.js';

/**
 * Bắt đầu đếm ngược trước khi xe khởi hành
 */
export const batDauDemNguoc = (idTuyen, dataTuyenRef, markerXeRef, animRefs, selectedRouteIdRef, onRouteSelectRef, mapRef, isTheoDoiRef, markerTheoDoiRef) => {
  const dataTuyen = dataTuyenRef.current[idTuyen];
  if (!dataTuyen) return;

  // Khởi tạo object lưu animation nếu chưa có
  if (!animRefs.current[idTuyen]) {
    animRefs.current[idTuyen] = {};
  }

  const { thoiGianBatDau, lichTrinh } = dataTuyen;
  
  // Hàm cập nhật đếm ngược mỗi giây
  const capNhatDemNguoc = () => {
    const now = new Date();
    const thoiGianConLai = thoiGianBatDau - now;

    // Nếu hết thời gian đếm ngược, bắt đầu chuyển động
    if (thoiGianConLai <= 0) {
      clearInterval(animRefs.current[idTuyen].demNguoc);
      batDauDiChuyenXe(
        idTuyen, 
        dataTuyenRef, 
        markerXeRef, 
        animRefs, 
        selectedRouteIdRef, 
        onRouteSelectRef, 
        mapRef, 
        isTheoDoiRef, 
        markerTheoDoiRef
      );
      return;
    }

    // Tính phút và giây còn lại
    const phut = Math.floor(thoiGianConLai / (1000 * 60));
    const giay = Math.floor((thoiGianConLai % (1000 * 60)) / 1000);

    // Cập nhật tooltip với thời gian đếm ngược
    const marker = markerXeRef.current[idTuyen];
    if (marker) {
      const tooltipContent = `
        <b>Mã xe: ${lichTrinh.xb_id || 'Lỗi'}</b><br/>
        <b>Mã tài xế: ${lichTrinh.tx_id || 'Lỗi'}</b><br/>
        <b>Mã tuyến: ${idTuyen}</b><br/>
        <b>Ngày khởi hành:</b> ${lichTrinh.ngay_xe ? new Date(lichTrinh.ngay_xe).toLocaleDateString('vi-VN') : 'Lỗi'}<br/>
        <b>Trạng thái:</b> Chờ khởi hành (còn ${phut}p ${giay}s)<br/>
        <b>Khởi hành:</b> ${lichTrinh.gio_di || 'Lỗi'}<br/>
        <b>Đến dự kiến:</b> ${dataTuyen.thoiGianKetThuc ? formatTime(dataTuyen.thoiGianKetThuc) : 'Đang tính...'}<br/>
        <b>Vận tốc:</b> ${VAN_TOC} km/h<br/>
        <b>Khoảng cách thực:</b> ${dataTuyen ? (dataTuyen.tongS / 1000).toFixed(2) + ' km' : 'Đang tính...'}
      `;
      marker.getTooltip().setContent(tooltipContent);
    }

    // Cập nhật trạng thái trạm
    capNhatTrangThaiTram(idTuyen, 0, 'waiting', dataTuyenRef, selectedRouteIdRef, onRouteSelectRef);
  };

  // Xóa interval cũ nếu có và tạo mới
  if (animRefs.current[idTuyen]?.demNguoc) {
    clearInterval(animRefs.current[idTuyen].demNguoc);
  }

  animRefs.current[idTuyen].demNguoc = setInterval(capNhatDemNguoc, 1000);
  capNhatDemNguoc(); // Chạy ngay lần đầu
};

/**
 * Bắt đầu di chuyển xe trên bản đồ
 */
export const batDauDiChuyenXe = (idTuyen, dataTuyenRef, markerXeRef, animRefs, selectedRouteIdRef, onRouteSelectRef, mapRef, isTheoDoiRef, markerTheoDoiRef) => {
  // Kiểm tra dataTuyenRef tồn tại
  if (!dataTuyenRef || !dataTuyenRef.current) {
    console.error('dataTuyenRef không tồn tại cho tuyến:', idTuyen);
    return;
  }

  const dataTuyen = dataTuyenRef.current[idTuyen];
  if (!dataTuyen) {
    console.error('Không tìm thấy dữ liệu tuyến cho id:', idTuyen);
    return;
  }

  // Khởi tạo object animation nếu chưa có
  if (!animRefs.current[idTuyen]) {
    animRefs.current[idTuyen] = {};
  }

  const { toaDoDoans, thoiGianBatDau, tongS, kcTram, lichTrinh } = dataTuyen;

  // Tính quãng đường đã đi dựa trên thời gian
  const now = new Date();
  const thoiGianHoatDong = (now - thoiGianBatDau) / 1000;
  const quangDuongDaDi = Math.min(thoiGianHoatDong * (VAN_TOC * 1000 / 3600), tongS);
  
  // Tìm vị trí hiện tại của xe
  const viTriHienTai = timViTriXe(toaDoDoans, quangDuongDaDi);
  if (!viTriHienTai) return;

  // Tạo hoặc cập nhật marker xe
  let marker = markerXeRef.current[idTuyen];
  if (!marker) {
    const trangThai = { status: 'active', desc: 'Đang hoạt động', opacity: 1 };
    marker = capNhatMarkerXe(idTuyen, viTriHienTai, lichTrinh, trangThai, mapRef, markerXeRef, dataTuyenRef);
    if (!marker) return;
  }

  marker.setLatLng(viTriHienTai);
  marker.setOpacity(1);

  // Xác định trạng thái và cập nhật trạm
  let status = 'moving';
  if (quangDuongDaDi >= tongS) {
    status = 'finished';
  }
  capNhatTrangThaiTram(idTuyen, quangDuongDaDi, status, dataTuyenRef, selectedRouteIdRef, onRouteSelectRef);

  // Tự động theo dõi nếu đang chế độ theo dõi
  if (isTheoDoiRef.current && markerTheoDoiRef.current === marker && mapRef.current) {
    mapRef.current.setView(viTriHienTai);
  }

  // Tìm trạm tiếp theo và thời gian đến
  let tramTiepTheo = null;
  for (let i = 0; i < kcTram.length; i++) {
    if (kcTram[i].kcDenTram > quangDuongDaDi) {
      const kcConLai = kcTram[i].kcDenTram - quangDuongDaDi;
      const tgConLai = Math.ceil(kcConLai / (VAN_TOC * 1000 / 3600));
      
      tramTiepTheo = {
        tram: kcTram[i].tram,
        idx: i,
        tgConLai: Math.max(0, tgConLai)
      };
      break;
    }
  }

  // Tính thời gian kết thúc
  const thoiGianKetThuc = new Date(thoiGianBatDau.getTime() + (tongS / (VAN_TOC * 1000 / 3600) * 1000));

  let tooltipContent = "";

  // Tạo nội dung tooltip tùy theo trạng thái
  if (tramTiepTheo && tramTiepTheo.tgConLai > 0) {
    const phutConLai = Math.floor(tramTiepTheo.tgConLai / 60);
    const giayConLai = tramTiepTheo.tgConLai % 60;
    
    tooltipContent = `
      <b>Mã xe: ${lichTrinh.xb_id || 'Lỗi'}</b><br/>
      <b>Mã tài xế: ${lichTrinh.tx_id || 'Lỗi'}</b><br/>
      <b>Mã tuyến: ${idTuyen}</b><br/>
      <b>Trạm tiếp theo:</b> ${tramTiepTheo.tram.ten_stop}<br/>
      <b>Đến trạm sau:</b> ${phutConLai}p ${giayConLai}s<br/>
      <b>Ngày khởi hành:</b> ${lichTrinh.ngay_xe ? new Date(lichTrinh.ngay_xe).toLocaleDateString('vi-VN') : 'Lỗi'}<br/>
      <b>Giờ khởi hành:</b> ${lichTrinh.gio_di || 'Lỗi'}<br/>
      <b>Giờ dự kiến KT:</b> ${formatTime(thoiGianKetThuc)}<br/>
      <b>Trạng thái:</b> Đang hoạt động<br/>
      <b>Vận tốc:</b> ${VAN_TOC} km/h<br/>
      <b>Khoảng cách thực:</b> ${(tongS / 1000).toFixed(2)} km
    `;
  } else if (quangDuongDaDi >= tongS) {
    tooltipContent = `
      <b>Mã xe: ${lichTrinh.xb_id || 'Lỗi'}</b><br/>
      <b>Mã tài xế: ${lichTrinh.tx_id || 'Lỗi'}</b><br/>
      <b>Mã tuyến: ${idTuyen}</b><br/>
      <b>Ngày khởi hành:</b> ${lichTrinh.ngay_xe ? new Date(lichTrinh.ngay_xe).toLocaleDateString('vi-VN') : 'Lỗi'}<br/>
      <b>Giờ khởi hành:</b> ${lichTrinh.gio_di || 'Lỗi'}<br/>
      <b>Giờ dự kiến KT:</b> ${formatTime(thoiGianKetThuc)}<br/>
      <b>Trạng thái:</b> Đã kết thúc<br/>
      <b>Vận tốc:</b> ${VAN_TOC} km/h<br/>
      <b>Khoảng cách thực:</b> ${(tongS / 1000).toFixed(2)} km
    `;
  } else {
    tooltipContent = `
      <b>Mã xe: ${lichTrinh.xb_id || 'Lỗi'}</b><br/>
      <b>Mã tài xế: ${lichTrinh.tx_id || 'Lỗi'}</b><br/>
      <b>Mã tuyến: ${idTuyen}</b><br/>
      <b>Ngày khởi hành:</b> ${lichTrinh.ngay_xe ? new Date(lichTrinh.ngay_xe).toLocaleDateString('vi-VN') : 'Lỗi'}<br/>
      <b>Giờ khởi hành:</b> ${lichTrinh.gio_di || 'Lỗi'}<br/>
      <b>Giờ dự kiến KT:</b> ${formatTime(thoiGianKetThuc)}<br/>
      <b>Trạng thái:</b> Đang hoạt động<br/>
      <b>Vận tốc:</b> ${VAN_TOC} km/h<br/>
      <b>Khoảng cách thực:</b> ${(tongS / 1000).toFixed(2)} km
    `;
  }

  // Cập nhật tooltip
  if (marker && marker.getTooltip) {
    marker.getTooltip().setContent(tooltipContent);
  }

  // Dừng animation nếu xe đã đến cuối tuyến
  if (quangDuongDaDi >= tongS) {
    danhDauXeKetThuc(idTuyen, lichTrinh, markerXeRef, dataTuyenRef);
    return;
  }

  // Lên lịch cho lần cập nhật tiếp theo
  if (animRefs.current[idTuyen]?.animation) {
    clearTimeout(animRefs.current[idTuyen].animation);
  }

  animRefs.current[idTuyen].animation = setTimeout(
    () => batDauDiChuyenXe(idTuyen, dataTuyenRef, markerXeRef, animRefs, selectedRouteIdRef, onRouteSelectRef, mapRef, isTheoDoiRef, markerTheoDoiRef), 
    1000 // Cập nhật mỗi giây
  );
};

/**
 * Đánh dấu xe đã kết thúc hành trình
 */
export const danhDauXeKetThuc = (idTuyen, lichTrinh, markerXeRef, dataTuyenRef) => {
  const marker = markerXeRef.current[idTuyen];
  if (marker) {
    const dataTuyen = dataTuyenRef.current ? dataTuyenRef.current[idTuyen] : null;
    const tongS = dataTuyen ? dataTuyen.tongS : 0;
    
    const tooltipContent = `
      <b>Mã xe: ${lichTrinh.xb_id || 'Lỗi'}</b><br/>
      <b>Mã tài xế: ${lichTrinh.tx_id || 'Lỗi'}</b><br/>
      <b>Mã tuyến: ${idTuyen}</b><br/>
      <b>Trạng thái:</b> Đã kết thúc
    `;
    marker.getTooltip().setContent(tooltipContent);
    marker.setOpacity(0.3); // Làm mờ marker khi kết thúc
  }
};