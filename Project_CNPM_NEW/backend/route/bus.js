// File: backend/route/bus.js
const express = require('express');
const router = express.Router();
const pool = require('../db.js'); 
/* ==========================================================
 * LẤY 1 XE THEO ID (GET /api/buses/:id)
 * Sửa lỗi: Thêm DATE_FORMAT cho 'registry'
 * ========================================================== */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const sql = `
      SELECT 
        b.bus_id AS id,
        b.license_plate AS license,
        b.default_route_id AS route_id,
        b.driver_id,
        b.status,
        b.departure_status AS departure,
        
        -- SỬA LỖI: Thêm DATE_FORMAT
        DATE_FORMAT(b.registry, '%Y-%m-%d') AS registry,
        
        r.route_name AS route_name,
        d.name AS driver_name
        
      FROM bus b
      LEFT JOIN route r ON b.default_route_id = r.route_id
      LEFT JOIN driver d ON b.driver_id = d.driver_id
      WHERE b.bus_id = ?
    `;
    const [rows] = await pool.query(sql, [id]);

    if (rows.length > 0) {
      const bus = rows[0];
      res.json({
        ...bus,
        route: bus.route_name,
        driver: bus.driver_name
      });
    } else {
      res.status(404).json({ message: "Không tìm thấy xe buýt" });
    }
  } catch (err) {
    console.error("Lỗi khi lấy chi tiết xe:", err.sqlMessage || err.message);
    res.status(500).json({ error: 'Lỗi máy chủ' });
  }
});

/* ==========================================================
 * THÊM XE MỚI (POST /api/buses)
 * (Logic không có 'driver')
 * ========================================================== */
router.post('/', async (req, res) => {
  const { id, license, route, status, departure, registry } = req.body;

  let connection;
  try {
    connection = await pool.getConnection();
    await connection.beginTransaction();

    const [routeRows] = await connection.query("SELECT route_id FROM route WHERE route_name = ?", [route]);
    const route_id = routeRows.length > 0 ? routeRows[0].route_id : null;

    const insertSql = `
      INSERT INTO bus (bus_id, license_plate, default_route_id, status, departure_status, registry)
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    await connection.query(insertSql, [id, license, route_id, status, departure, registry]);
    
    await connection.commit();
    connection.release();
    
    res.status(201).json({ message: "Thêm xe buýt thành công" });

  } catch (err) {
    if (connection) {
      await connection.rollback();
      connection.release();
    }
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ message: "Mã số xe đã tồn tại" });
    }
    console.error("Lỗi khi thêm xe buýt:", err.sqlMessage || err.message);
    res.status(500).json({ message: "Lỗi máy chủ khi thêm xe" });
  }
});

/* ==========================================================
 * CẬP NHẬT XE (PUT /api/buses/:id)
 * (Logic không có 'driver')
 * ========================================================== */
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { license, route, status, departure, registry } = req.body;

  let connection;
  try {
    connection = await pool.getConnection();
    await connection.beginTransaction();

    const [routeRows] = await connection.query("SELECT route_id FROM route WHERE route_name = ?", [route]);
    const route_id = routeRows.length > 0 ? routeRows[0].route_id : null;

    const updateSql = `
      UPDATE bus 
      SET license_plate = ?, default_route_id = ?, status = ?, departure_status = ?, registry = ?
      WHERE bus_id = ?
    `;
    const [result] = await connection.query(updateSql, [license, route_id, status, departure, registry, id]);

    if (result.affectedRows === 0) {
      await connection.rollback();
      connection.release();
      return res.status(404).json({ message: "Không tìm thấy xe buýt để cập nhật" });
    }

    await connection.commit();
    connection.release();
    res.json({ message: "Cập nhật xe buýt thành công" });

  } catch (err) {
    if (connection) {
      await connection.rollback();
      connection.release();
    }
    console.error("Lỗi khi cập nhật xe buýt:", err.sqlMessage || err.message);
    res.status(500).json({ message: "Lỗi máy chủ khi cập nhật" });
  }
});

/* ==========================================================
 * XÓA XE (DELETE /api/buses/:id)
 * ========================================================== */
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const sql = `DELETE FROM bus WHERE bus_id = ?`;
    const [result] = await pool.query(sql, [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Không tìm thấy xe buýt' });
    }

    res.json({ message: 'Xóa xe buýt thành công' });
    
  } catch (err) {
    console.error(`Lỗi khi xóa xe ${req.params.id}:`, err.sqlMessage || err.message);
    if (err.code === 'ER_ROW_IS_REFERENCED_2') {
      return res.status(409).json({ 
        error: 'Không thể xóa: Xe buýt này đã được gán vào lịch sử dụng.'
      });
    }
    res.status(500).json({ error: 'Lỗi máy chủ khi xóa' });
  }
});

/* ==========================================================
 * LẤY DANH SÁCH XE (GET /api/buses)
 * (Lấy tài xế theo ngày + Sửa lỗi ngày đăng kiểm)
 * ========================================================== */

router.get('/', async (req, res) => {
  try {
    const { status, departure } = req.query; 

    let sql = `
      SELECT 
        b.bus_id AS id,
        b.license_plate AS license,
        
        -- ko co data thi ko hien
        r_daily.route_name AS route,
        
        b.status,
        b.departure_status AS departure,
        DATE_FORMAT(b.registry, '%Y-%m-%d') AS registry,
        d.name AS driver 
        
      FROM bus b
      
      -- 1. Lấy lịch trình của ngày hôm nay (CURDATE)
      LEFT JOIN bus_schedule bs ON b.bus_id = bs.bus_id AND bs.schedule_date = CURDATE()
      
      -- 2. Join bảng route lần 1: Lấy tên tuyến Mặc Định (của xe)
      LEFT JOIN route r_default ON b.default_route_id = r_default.route_id
      
      -- 3. Join bảng route lần 2: Lấy tên tuyến theo Lịch Trình (của hôm nay)
      LEFT JOIN route r_daily ON bs.route_id = r_daily.route_id
      
      -- 4. Lấy tài xế từ lịch trình
      LEFT JOIN driver d ON bs.driver_id = d.driver_id
    `;
    
    const params = []; 
    const whereClauses = [];

    if (status) {
      whereClauses.push("b.status = ?");
      params.push(status);
    }
    if (departure) {
      whereClauses.push("b.departure_status = ?");
      params.push(departure);
    }

    if (whereClauses.length > 0) {
      sql += " WHERE " + whereClauses.join(" AND ");
    }
    
    sql += " ORDER BY b.bus_id ASC";

    const [vehicles] = await pool.query(sql, params);
    res.json(vehicles);

  } catch (err) {
    console.error("Lỗi khi lấy danh sách xe:", err.sqlMessage || err.message);
    res.status(500).json({ error: 'Lỗi máy chủ' });
  }
});

module.exports = router;