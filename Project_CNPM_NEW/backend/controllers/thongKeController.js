// controllers/thongKeController.js
const thongKeModel = require('../models/thongKeModel');

const getThongKe = async (req, res) => {
  try {
    const data = await thongKeModel.getThongKe();
    res.json(data); // trả về dạng JSON cho React
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: 'Lỗi server' });
  }
};

module.exports = { getThongKe };