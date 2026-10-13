// File: backend/route/route.js
const express = require('express');
const router = express.Router();
const pool = require('../db.js');

/* ==========================================================
 * LẤY DANH SÁCH TUYẾN (GET /api/routes)
 * Dùng cho dropdown
 * ========================================================== */
router.get('/', async (req, res) => {
  try {
    // Lấy tất cả thông tin để hiển thị dropdown rõ ràng
    const sql = `
      SELECT route_id, route_name, start_point, end_point 
      FROM route
      ORDER BY route_id ASC
    `;
    const [routes] = await pool.query(sql);
    res.json(routes);
  } catch (err) {
    console.error("Lỗi khi lấy danh sách tuyến:", err.sqlMessage || err.message);
    res.status(500).json({ error: 'Lỗi máy chủ' });
  }
});

module.exports = router;