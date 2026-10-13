import L from 'leaflet';
import { VAN_TOC } from './constants.js';
import { trungDate, parseDateTime } from './handleDateTime.js';

/**
 * Tìm vị trí hiện tại của xe dựa trên quãng đường đã đi
 */
export const timViTriXe = (toaDoDoans, quangDuongDaDi) => {
  if (!toaDoDoans || toaDoDoans.length === 0) return null;
  if (quangDuongDaDi <= 0) return toaDoDoans[0];
  
  let tongS = 0;
  
  // Duyệt qua các đoạn đường để tìm vị trí chính xác
  for (let i = 0; i < toaDoDoans.length - 1; i++) {
    const doanDuong = toaDoDoans[i].distanceTo(toaDoDoans[i + 1]);
    
    if (tongS + doanDuong >= quangDuongDaDi) {
      // Tính vị trí dựa trên tỉ lệ quãng đường đã đi
      const tiLe = (quangDuongDaDi - tongS) / doanDuong;
      const lat = toaDoDoans[i].lat + (toaDoDoans[i + 1].lat - toaDoDoans[i].lat) * tiLe;
      const lng = toaDoDoans[i].lng + (toaDoDoans[i + 1].lng - toaDoDoans[i].lng) * tiLe;
      return L.latLng(lat, lng);
    }
    tongS += doanDuong;
  }
  
  return toaDoDoans[toaDoDoans.length - 1];
};

/**
 * Tính khoảng cách từ điểm đầu đến từng trạm
 */
export const tinhKCdenTram = (toaDoDoans, dsTram) => {
  if (!toaDoDoans || !dsTram) return [];
  
  return dsTram.map((tram, idxTram) => {
    // Trạm đầu tiên luôn có khoảng cách 0
    if (idxTram === 0) return { tram, kcDenTram: 0, idxTram, viTriTrenDuong: 0 };
    
    // Trạm cuối cùng có khoảng cách = tổng chiều dài tuyến
    if (idxTram === dsTram.length - 1) {
      let tongS = 0;
      for (let i = 0; i < toaDoDoans.length - 1; i++) {
        tongS += toaDoDoans[i].distanceTo(toaDoDoans[i + 1]);
      }
      return { tram, kcDenTram: tongS, idxTram, viTriTrenDuong: toaDoDoans.length - 1 };
    }

    // Tìm điểm gần nhất trên tuyến đường với trạm
    let viTriGanNhat = 0;
    let khoangCachNganNhat = Infinity;
    
    for (let i = 0; i < toaDoDoans.length; i++) {
      const khoangCach = toaDoDoans[i].distanceTo(L.latLng(tram.lat, tram.lng));
      if (khoangCach < khoangCachNganNhat) {
        khoangCachNganNhat = khoangCach;
        viTriGanNhat = i;
      }
    }
    
    // Tính khoảng cách từ đầu đến điểm gần nhất đó
    let kcDenTram = 0;
    for (let i = 0; i < viTriGanNhat; i++) {
      kcDenTram += toaDoDoans[i].distanceTo(toaDoDoans[i + 1]);
    }
    
    return { tram, kcDenTram, idxTram, viTriTrenDuong: viTriGanNhat };
  });
};

/**
 * Xác định trạng thái hiện tại của xe
 */
export const layTrangThaiXe = (lichTrinh, thoiGianBatDau, dataTuyenRef) => {
  const now = new Date();
  
  // Kiểm tra dữ liệu hợp lệ
  if (!lichTrinh || !thoiGianBatDau || isNaN(thoiGianBatDau.getTime())) {
    return { status: 'inactive', desc: 'Không hoạt động', opacity: 0.3 };
  }

  const ngayLich = new Date(lichTrinh.ngay_xe);

  // Kiểm tra lịch có trong ngày hôm nay không
  if (!trungDate(now, ngayLich)) {
    return { status: 'inactive', desc: 'Không hoạt động', opacity: 0.3 };
  }

  // Xác định trạng thái dựa trên thời gian
  if (now < thoiGianBatDau) {
    return { status: 'waiting', desc: 'Chờ khởi hành', opacity: 0.7 };
  } else {
    const thoiGianHoatDong = (now - thoiGianBatDau) / 1000;
    const quangDuongDaDi = thoiGianHoatDong * (VAN_TOC * 1000 / 3600);
    const dataTuyen = dataTuyenRef.current[lichTrinh.td_id];
    
    if (dataTuyen && quangDuongDaDi >= dataTuyen.tongS) {
      return { status: 'finished', desc: 'Đã kết thúc', opacity: 1 };
    } else {
      return { status: 'active', desc: 'Đang hoạt động', opacity: 1 };
    }
  }
};

/**
 * Cập nhật thông tin trạm hiện tại và trạm tiếp theo
 */
export const capNhatTrangThaiTram = (idTuyen, quangDuongDaDi, status = 'moving', dataTuyenRef, selectedRouteIdRef, onRouteSelectRef) => {
  const dataTuyen = dataTuyenRef.current[idTuyen];
  if (!dataTuyen || !dataTuyen.kcTram) return;

  let tramHienTai = -1;
  let tramTiepTheo = -1;

  // Xác định trạm hiện tại dựa trên trạng thái
  if (status === 'waiting') {
    tramHienTai = 0;
    tramTiepTheo = 1;
  } else if (status === 'finished') {
    tramHienTai = dataTuyen.dsTram.length - 1;
    tramTiepTheo = -1;
  } else {
    // Tìm trạm gần nhất mà xe đã đi qua
    for (let i = 0; i < dataTuyen.kcTram.length; i++) {
      if (quangDuongDaDi >= dataTuyen.kcTram[i].kcDenTram) {
        tramHienTai = i;
      } else {
        break;
      }
    }
    tramTiepTheo = tramHienTai + 1;
    if (tramTiepTheo >= dataTuyen.kcTram.length) {
      tramTiepTheo = -1;
    }
  }

  // Gọi callback để thông báo cho component cha
  if (onRouteSelectRef.current && selectedRouteIdRef.current === idTuyen) {
    onRouteSelectRef.current({
      routeId: idTuyen,
      stops: dataTuyen.dsTram || [],
      currentStopIndex: tramHienTai,
      nextStopIndex: tramTiepTheo,
      distanceTraveled: quangDuongDaDi,
      estimatedTime: new Date(),
      busInfo: dataTuyen.lichTrinh,
      status: status,
      totalDistance: dataTuyen.tongS,
      vanToc: VAN_TOC,
      gioDuKienKT: new Date(dataTuyen.thoiGianBatDau.getTime() + (dataTuyen.tongS / (VAN_TOC * 1000 / 3600) * 1000))
    });
  }
};