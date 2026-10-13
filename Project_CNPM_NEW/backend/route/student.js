// route/student.js
const express = require('express');
const router = express.Router();
const pool = require('../db.js');

// Lấy tất cả học sinh với thông tin liên quan
router.get('/', async (req, res) => {
  try {
    const query = `
      SELECT 
        s.*,
        p.name as parent_name,
        p.phone as parent_phone,
        p.email as parent_email,
        bs_pickup.stop_name as pickup_stop_name,
        bs_pickup.address as pickup_address,
        bs_dropoff.stop_name as dropoff_stop_name,
        bs_dropoff.address as dropoff_address
      FROM student s
      LEFT JOIN parent p ON s.parent_id = p.parent_id
      LEFT JOIN bus_stop bs_pickup ON s.stop_id = bs_pickup.stop_id
      LEFT JOIN bus_stop bs_dropoff ON s.dropoff_stop_id = bs_dropoff.stop_id
      ORDER BY s.student_id
    `;
    
    const [rows] = await pool.query(query);
    res.json({ 
      success: true, 
      data: rows,
      count: rows.length 
    });
  } catch (error) {
    console.error('Error in GET /students:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Lỗi server khi lấy danh sách học sinh',
      error: error.message 
    });
  }
});

// Lấy học sinh theo ID
router.get('/:id', async (req, res) => {
  try {
    const studentId = req.params.id;
    
    const query = `
      SELECT 
        s.*,
        p.name as parent_name,
        p.phone as parent_phone,
        p.email as parent_email,
        p.address as parent_address,
        bs_pickup.stop_name as pickup_stop_name,
        bs_pickup.address as pickup_address,
        bs_pickup.route_id as pickup_route_id,
        bs_dropoff.stop_name as dropoff_stop_name,
        bs_dropoff.address as dropoff_address,
        bs_dropoff.route_id as dropoff_route_id
      FROM student s
      LEFT JOIN parent p ON s.parent_id = p.parent_id
      LEFT JOIN bus_stop bs_pickup ON s.stop_id = bs_pickup.stop_id
      LEFT JOIN bus_stop bs_dropoff ON s.dropoff_stop_id = bs_dropoff.stop_id
      WHERE s.student_id = ?
    `;
    
    const [rows] = await pool.query(query, [studentId]);
    
    if (rows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Không tìm thấy học sinh' 
      });
    }
    
    // Lấy lịch sử đón trả của học sinh
    const pickupQuery = `
      SELECT 
        sp.*,
        d.name as driver_name,
        d.phone as driver_phone,
        b.license_plate,
        bs.stop_name,
        r.route_name
      FROM student_pickup sp
      LEFT JOIN driver d ON sp.driver_id = d.driver_id
      LEFT JOIN bus_schedule bsched ON sp.schedule_id = bsched.schedule_id
      LEFT JOIN bus b ON bsched.bus_id = b.bus_id
      LEFT JOIN bus_stop bs ON sp.stop_id = bs.stop_id
      LEFT JOIN route r ON bsched.route_id = r.route_id
      WHERE sp.student_id = ?
      ORDER BY sp.pickup_time DESC
      LIMIT 10
    `;
    
    const [pickupRows] = await pool.query(pickupQuery, [studentId]);
    
    const studentData = {
      ...rows[0],
      pickup_history: pickupRows
    };
    
    res.json({ 
      success: true, 
      data: studentData 
    });
  } catch (error) {
    console.error('Error in GET /students/:id:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Lỗi server khi lấy thông tin học sinh',
      error: error.message 
    });
  }
});

// Tạo học sinh mới
router.post('/', async (req, res) => {
  try {
    const {
      student_id,
      parent_id,
      stop_id,
      dropoff_stop_id,
      name,
      school_name,
      class_name,
      gender
    } = req.body;
    
    // Kiểm tra dữ liệu bắt buộc
    if (!student_id || !name || !school_name || !class_name) {
      return res.status(400).json({
        success: false,
        message: 'Thiếu thông tin bắt buộc: student_id, name, school_name, class_name'
      });
    }
    
    // Kiểm tra học sinh đã tồn tại chưa
    const [existing] = await pool.query(
      'SELECT * FROM student WHERE student_id = ?',
      [student_id]
    );
    
    if (existing.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Mã học sinh đã tồn tại'
      });
    }
    
    // Tạo học sinh mới
    const query = `
      INSERT INTO student 
      (student_id, parent_id, stop_id, dropoff_stop_id, name, school_name, class_name, gender)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    const [result] = await pool.query(query, [
      student_id,
      parent_id || null,
      stop_id || null,
      dropoff_stop_id || null,
      name,
      school_name,
      class_name,
      gender || null
    ]);
    
    // Lấy thông tin học sinh vừa tạo
    const [newStudent] = await pool.query(
      'SELECT * FROM student WHERE student_id = ?',
      [student_id]
    );
    
    res.status(201).json({
      success: true,
      message: 'Tạo học sinh thành công',
      data: newStudent[0]
    });
  } catch (error) {
    console.error('Error in POST /students:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi tạo học sinh',
      error: error.message
    });
  }
});

// Cập nhật học sinh
router.put('/:id', async (req, res) => {
  try {
    const studentId = req.params.id;
    const {
      parent_id,
      stop_id,
      dropoff_stop_id,
      name,
      school_name,
      class_name,
      gender
    } = req.body;
    
    // Kiểm tra học sinh có tồn tại không
    const [existing] = await pool.query(
      'SELECT * FROM student WHERE student_id = ?',
      [studentId]
    );
    
    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy học sinh'
      });
    }
    
    // Cập nhật thông tin
    const query = `
      UPDATE student SET
        parent_id = ?,
        stop_id = ?,
        dropoff_stop_id = ?,
        name = ?,
        school_name = ?,
        class_name = ?,
        gender = ?
      WHERE student_id = ?
    `;
    
    const [result] = await pool.query(query, [
      parent_id || null,
      stop_id || null,
      dropoff_stop_id || null,
      name,
      school_name,
      class_name,
      gender || null,
      studentId
    ]);
    
    // Lấy thông tin đã cập nhật
    const [updatedStudent] = await pool.query(
      'SELECT * FROM student WHERE student_id = ?',
      [studentId]
    );
    
    res.json({
      success: true,
      message: 'Cập nhật học sinh thành công',
      data: updatedStudent[0]
    });
  } catch (error) {
    console.error('Error in PUT /students/:id:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi cập nhật học sinh',
      error: error.message
    });
  }
});

// Xóa học sinh
router.delete('/:id', async (req, res) => {
  try {
    const studentId = req.params.id;
    
    // Kiểm tra học sinh có tồn tại không
    const [existing] = await pool.query(
      'SELECT * FROM student WHERE student_id = ?',
      [studentId]
    );
    
    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy học sinh'
      });
    }
    
    // Xóa học sinh
    await pool.query(
      'DELETE FROM student WHERE student_id = ?',
      [studentId]
    );
    
    res.json({
      success: true,
      message: 'Xóa học sinh thành công'
    });
  } catch (error) {
    console.error('Error in DELETE /students/:id:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi xóa học sinh',
      error: error.message
    });
  }
});

// Tìm kiếm học sinh
router.get('/search/:keyword', async (req, res) => {
  try {
    const keyword = `%${req.params.keyword}%`;
    
    const query = `
      SELECT 
        s.*,
        p.name as parent_name,
        p.phone as parent_phone,
        bs_pickup.stop_name as pickup_stop_name,
        bs_dropoff.stop_name as dropoff_stop_name
      FROM student s
      LEFT JOIN parent p ON s.parent_id = p.parent_id
      LEFT JOIN bus_stop bs_pickup ON s.stop_id = bs_pickup.stop_id
      LEFT JOIN bus_stop bs_dropoff ON s.dropoff_stop_id = bs_dropoff.stop_id
      WHERE s.name LIKE ? 
         OR s.student_id LIKE ? 
         OR s.school_name LIKE ? 
         OR s.class_name LIKE ?
         OR p.name LIKE ?
      ORDER BY s.name
    `;
    
    const [rows] = await pool.query(query, [
      keyword, keyword, keyword, keyword, keyword
    ]);
    
    res.json({
      success: true,
      data: rows,
      count: rows.length,
      keyword: req.params.keyword
    });
  } catch (error) {
    console.error('Error in GET /students/search/:keyword:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi tìm kiếm học sinh',
      error: error.message
    });
  }
});

// Lấy học sinh theo phụ huynh
router.get('/parent/:parentId', async (req, res) => {
  try {
    const parentId = req.params.parentId;
    
    const query = `
      SELECT 
        s.*,
        bs_pickup.stop_name as pickup_stop_name,
        bs_dropoff.stop_name as dropoff_stop_name
      FROM student s
      LEFT JOIN bus_stop bs_pickup ON s.stop_id = bs_pickup.stop_id
      LEFT JOIN bus_stop bs_dropoff ON s.dropoff_stop_id = bs_dropoff.stop_id
      WHERE s.parent_id = ?
      ORDER BY s.name
    `;
    
    const [rows] = await pool.query(query, [parentId]);
    
    res.json({
      success: true,
      data: rows,
      count: rows.length,
      parent_id: parentId
    });
  } catch (error) {
    console.error('Error in GET /students/parent/:parentId:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi lấy học sinh theo phụ huynh',
      error: error.message
    });
  }
});

// Lấy học sinh theo điểm đón
router.get('/stop/pickup/:stopId', async (req, res) => {
  try {
    const stopId = req.params.stopId;
    
    const query = `
      SELECT 
        s.*,
        p.name as parent_name,
        p.phone as parent_phone
      FROM student s
      LEFT JOIN parent p ON s.parent_id = p.parent_id
      WHERE s.stop_id = ?
      ORDER BY s.name
    `;
    
    const [rows] = await pool.query(query, [stopId]);
    
    res.json({
      success: true,
      data: rows,
      count: rows.length,
      stop_id: stopId
    });
  } catch (error) {
    console.error('Error in GET /students/stop/pickup/:stopId:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi lấy học sinh theo điểm đón',
      error: error.message
    });
  }
});

// Lấy học sinh theo điểm trả
router.get('/stop/dropoff/:stopId', async (req, res) => {
  try {
    const stopId = req.params.stopId;
    
    const query = `
      SELECT 
        s.*,
        p.name as parent_name,
        p.phone as parent_phone
      FROM student s
      LEFT JOIN parent p ON s.parent_id = p.parent_id
      WHERE s.dropoff_stop_id = ?
      ORDER BY s.name
    `;
    
    const [rows] = await pool.query(query, [stopId]);
    
    res.json({
      success: true,
      data: rows,
      count: rows.length,
      stop_id: stopId
    });
  } catch (error) {
    console.error('Error in GET /students/stop/dropoff/:stopId:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi lấy học sinh theo điểm trả',
      error: error.message
    });
  }
});

// Lấy học sinh theo trường
router.get('/school/:schoolName', async (req, res) => {
  try {
    const schoolName = `%${req.params.schoolName}%`;
    
    const query = `
      SELECT 
        s.*,
        p.name as parent_name,
        p.phone as parent_phone,
        bs_pickup.stop_name as pickup_stop_name,
        bs_dropoff.stop_name as dropoff_stop_name
      FROM student s
      LEFT JOIN parent p ON s.parent_id = p.parent_id
      LEFT JOIN bus_stop bs_pickup ON s.stop_id = bs_pickup.stop_id
      LEFT JOIN bus_stop bs_dropoff ON s.dropoff_stop_id = bs_dropoff.stop_id
      WHERE s.school_name LIKE ?
      ORDER BY s.class_name, s.name
    `;
    
    const [rows] = await pool.query(query, [schoolName]);
    
    res.json({
      success: true,
      data: rows,
      count: rows.length,
      school_name: req.params.schoolName
    });
  } catch (error) {
    console.error('Error in GET /students/school/:schoolName:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi lấy học sinh theo trường',
      error: error.message
    });
  }
});

// Lấy học sinh theo lớp
router.get('/class/:className', async (req, res) => {
  try {
    const className = req.params.className;
    
    const query = `
      SELECT 
        s.*,
        p.name as parent_name,
        p.phone as parent_phone,
        bs_pickup.stop_name as pickup_stop_name,
        bs_dropoff.stop_name as dropoff_stop_name
      FROM student s
      LEFT JOIN parent p ON s.parent_id = p.parent_id
      LEFT JOIN bus_stop bs_pickup ON s.stop_id = bs_pickup.stop_id
      LEFT JOIN bus_stop bs_dropoff ON s.dropoff_stop_id = bs_dropoff.stop_id
      WHERE s.class_name = ?
      ORDER BY s.name
    `;
    
    const [rows] = await pool.query(query, [className]);
    
    res.json({
      success: true,
      data: rows,
      count: rows.length,
      class_name: className
    });
  } catch (error) {
    console.error('Error in GET /students/class/:className:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi lấy học sinh theo lớp',
      error: error.message
    });
  }
});

// Thống kê học sinh
router.get('/statistics/summary', async (req, res) => {
  try {
    // Tổng số học sinh
    const [totalResult] = await pool.query('SELECT COUNT(*) as total FROM student');
    
    // Thống kê theo giới tính
    const [genderResult] = await pool.query(`
      SELECT 
        gender,
        COUNT(*) as count,
        ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM student), 2) as percentage
      FROM student 
      GROUP BY gender
      ORDER BY count DESC
    `);
    
    // Thống kê theo trường
    const [schoolResult] = await pool.query(`
      SELECT 
        school_name,
        COUNT(*) as count
      FROM student 
      WHERE school_name IS NOT NULL
      GROUP BY school_name
      ORDER BY count DESC
    `);
    
    // Thống kê theo lớp
    const [classResult] = await pool.query(`
      SELECT 
        class_name,
        COUNT(*) as count
      FROM student 
      WHERE class_name IS NOT NULL
      GROUP BY class_name
      ORDER BY class_name
    `);
    
    // Học sinh có điểm đón/trả
    const [stopStatsResult] = await pool.query(`
      SELECT 
        COUNT(CASE WHEN stop_id IS NOT NULL THEN 1 END) as has_pickup_stop,
        COUNT(CASE WHEN dropoff_stop_id IS NOT NULL THEN 1 END) as has_dropoff_stop,
        COUNT(CASE WHEN stop_id IS NULL OR dropoff_stop_id IS NULL THEN 1 END) as missing_stop_info
      FROM student
    `);
    
    res.json({
      success: true,
      data: {
        total_students: totalResult[0].total,
        gender_statistics: genderResult,
        school_statistics: schoolResult,
        class_statistics: classResult,
        stop_statistics: stopStatsResult[0]
      }
    });
  } catch (error) {
    console.error('Error in GET /students/statistics/summary:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi lấy thống kê học sinh',
      error: error.message
    });
  }
});

// Lấy học sinh chưa có điểm đón
router.get('/missing/pickup-stop', async (req, res) => {
  try {
    const query = `
      SELECT 
        s.*,
        p.name as parent_name,
        p.phone as parent_phone
      FROM student s
      LEFT JOIN parent p ON s.parent_id = p.parent_id
      WHERE s.stop_id IS NULL
      ORDER BY s.name
    `;
    
    const [rows] = await pool.query(query);
    
    res.json({
      success: true,
      data: rows,
      count: rows.length,
      message: rows.length > 0 ? 'Có học sinh chưa có điểm đón' : 'Tất cả học sinh đã có điểm đón'
    });
  } catch (error) {
    console.error('Error in GET /students/missing/pickup-stop:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi lấy học sinh chưa có điểm đón',
      error: error.message
    });
  }
});

// Lấy học sinh chưa có điểm trả
router.get('/missing/dropoff-stop', async (req, res) => {
  try {
    const query = `
      SELECT 
        s.*,
        p.name as parent_name,
        p.phone as parent_phone
      FROM student s
      LEFT JOIN parent p ON s.parent_id = p.parent_id
      WHERE s.dropoff_stop_id IS NULL
      ORDER BY s.name
    `;
    
    const [rows] = await pool.query(query);
    
    res.json({
      success: true,
      data: rows,
      count: rows.length,
      message: rows.length > 0 ? 'Có học sinh chưa có điểm trả' : 'Tất cả học sinh đã có điểm trả'
    });
  } catch (error) {
    console.error('Error in GET /students/missing/dropoff-stop:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi lấy học sinh chưa có điểm trả',
      error: error.message
    });
  }
});

// Lấy học sinh chưa có phụ huynh
router.get('/missing/parent', async (req, res) => {
  try {
    const query = `
      SELECT *
      FROM student
      WHERE parent_id IS NULL
      ORDER BY name
    `;
    
    const [rows] = await pool.query(query);
    
    res.json({
      success: true,
      data: rows,
      count: rows.length,
      message: rows.length > 0 ? 'Có học sinh chưa có phụ huynh' : 'Tất cả học sinh đã có phụ huynh'
    });
  } catch (error) {
    console.error('Error in GET /students/missing/parent:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi lấy học sinh chưa có phụ huynh',
      error: error.message
    });
  }
});

module.exports = router;