/**
 * Định dạng thời gian thành HH:MM:SS
 */
export function formatTime(date) {
  if (!(date instanceof Date) || isNaN(date.getTime())) return "-";
  const pad = (num) => (num < 10 ? "0" + num : num);
  return `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}

/**
 * Kiểm tra hai ngày có cùng ngày tháng năm không
 */
export function trungDate(date1, date2) {
  if (!date1 || !date2) return false;
  
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  
  if (isNaN(d1.getTime()) || isNaN(d2.getTime())) return false;
  
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  );
}

/**
 * Kết hợp ngày và giờ để tạo đối tượng Date hoàn chỉnh
 */
export function parseDateTime(ngayXeString, gioDiString) {
  if (!ngayXeString || !gioDiString) return null;

  const ngayXe = new Date(ngayXeString);
  const [gio, phut, giay = 0] = gioDiString.split(':').map(Number);
  
  const thoiGianBatDau = new Date(
    ngayXe.getFullYear(),
    ngayXe.getMonth(),
    ngayXe.getDate(),
    gio,
    phut,
    giay
  );

  return isNaN(thoiGianBatDau.getTime()) ? null : thoiGianBatDau;
}