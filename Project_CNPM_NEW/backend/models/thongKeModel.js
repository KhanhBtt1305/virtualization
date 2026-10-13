// models/thongKeModel.js
const pool = require('../db'); // kết nối database

const getThongKe = async () => {
  const [xeBuyt] = await pool.query('SELECT COUNT(*) as count FROM bus');
  const [taiXe] = await pool.query('SELECT COUNT(*) as count FROM driver');
  const [hocSinh] = await pool.query('SELECT COUNT(*) as count FROM student');
  const [tuyenDuong] = await pool.query('SELECT COUNT(*) as count FROM route');

  return {
    xeBuyt: xeBuyt[0].count,
    taiXe: taiXe[0].count,
    hocSinh: hocSinh[0].count,
    tuyenDuong: tuyenDuong[0].count
  };
};

module.exports = { getThongKe };