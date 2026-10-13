// File: backend/route/driver.js
const express = require('express');
const router = express.Router();
// Đảm bảo đường dẫn này đúng
const pool = require('../db.js'); 

/* ==========================================================
 * GET /api/drivers (Giữ nguyên)
 * ========================================================== */
router.get('/', async (req, res) => {
  try {
    const sql = `
      SELECT 
        driver_id as id, 
        name, 
        phone, 
        address, 
        status, 
        license_class as licenseClass,
        work_schedule
      FROM \`driver\`
    `;
    
    const [drivers] = await pool.query(sql);
    
    const driversWithTrips = drivers.map(d => ({
      ...d,
      weeklyTrips: Math.floor(Math.random() * 6) 
    }));

    res.json(driversWithTrips);
  } catch (err) {
    console.error("Lỗi khi lấy danh sách tài xế:", err.sqlMessage || err.message);
    res.status(500).json({ error: 'Lỗi máy chủ' });
  }
});

/* ==========================================================
 * POST /api/drivers (Giữ nguyên)
 * ========================================================== */
router.post('/', async (req, res) => {
  try {
    const { id, name, phone, address, status, licenseClass, work_schedule } = req.body;
    
    const sql = `
      INSERT INTO \`driver\` 
        (driver_id, name, phone, address, status, license_class, work_schedule)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    
    await pool.query(sql, [id, name, phone, address, status, licenseClass, work_schedule]);
    
    const newDriver = {
      id, name, phone, address, status, licenseClass, work_schedule,
      weeklyTrips: 0 
    };
    
    res.status(201).json(newDriver); 
    
  } catch (err) {
    console.error("Lỗi khi thêm tài xế mới:", err.sqlMessage || err.message);
    res.status(500).json({ error: 'Lỗi máy chủ khi thêm tài xế' });
  }
});

/* ==========================================================
 * PUT /api/drivers/:id (Sửa tài xế - ĐÃ SỬA LỖI)
 * ========================================================== */
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params; 
    const { name, phone, address, status, licenseClass, work_schedule } = req.body; 

    const sql = `
      UPDATE \`driver\`
      SET 
        name = ?, 
        phone = ?, 
        address = ?, 
        status = ?, 
        license_class = ?,
        work_schedule = ?
      WHERE driver_id = ?
    `;
    
    // === 🔹 SỬA LỖI Ở ĐÂY: Thêm 'const [result] =' ===
    const [result] = await pool.query(sql, [name, phone, address, status, licenseClass, work_schedule, id]);
    // ===========================================

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Không tìm thấy tài xế' });
    }
    
    const updatedDriver = { id, name, phone, address, status, licenseClass, work_schedule };
    res.json(updatedDriver);
    
  } catch (err) {
    console.error(`Lỗi khi cập nhật tài xế ${req.params.id}:`, err.sqlMessage || err.message);
    res.status(500).json({ error: 'Lỗi máy chủ khi cập nhật' });
  }
});

/* ==========================================================
 * DELETE /api/drivers/:id (Giữ nguyên)
 * ========================================================== */
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const sql = `DELETE FROM \`driver\` WHERE driver_id = ?`;
    const [result] = await pool.query(sql, [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Không tìm thấy tài xế' });
    }

    res.json({ message: 'Xóa tài xế thành công' });
    
  } catch (err) {
    console.error(`Lỗi khi xóa tài xế ${req.params.id}:`, err.sqlMessage || err.message);
    if (err.code === 'ER_ROW_IS_REFERENCED_2') {
      return res.status(409).json({ 
        error: 'Không thể xóa: Tài xế này đã được gán vào lịch sử dụng.'
      });
    }
    res.status(500).json({ error: 'Lỗi máy chủ khi xóa' });
  }
});

module.exports = router;