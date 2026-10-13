// routes/thongKeRoutes.js
const express = require('express');
const router = express.Router();
const thongKeController = require('../controllers/thongKeController');

// Khi React gọi /api/thongke thì trả về số liệu
router.get('/', thongKeController.getThongKe);

module.exports = router;