const express = require('express');
const router = express.Router();
const pool = require('../db.js');

/* ==========================================================
 * GET /api/schedules
 *  -> Lấy lịch đã xếp trong khoảng ngày [startDate, endDate]
 * ========================================================== */
router.get('/', async (req, res) => {
  const { startDate, endDate } = req.query;

  console.log(`--- [GET /api/schedules] from ${startDate} to ${endDate}`);

  if (!startDate || !endDate) {
    return res
      .status(400)
      .json({ error: 'Thiếu thông số startDate hoặc endDate' });
  }

  try {
    const sql = `
      SELECT 
        bs.schedule_date,
        b.bus_id as busId,
        b.license_plate as plate,
        r.route_name as route,
        d.name as driverName,
        d.driver_id as driverId,
        TIME_FORMAT(bs.start_time, '%H:%i') as startTime,
        TIME_FORMAT(bs.end_time,   '%H:%i') as endTime
      FROM \`bus_schedule\` bs
      LEFT JOIN \`bus\` b    ON bs.bus_id    = b.bus_id
      LEFT JOIN \`driver\` d ON bs.driver_id = d.driver_id
      LEFT JOIN \`route\` r  ON bs.route_id  = r.route_id
      WHERE bs.schedule_date BETWEEN ? AND ?
      ORDER BY bs.schedule_date, bs.start_time
    `;

    const [rows] = await pool.query(sql, [startDate, endDate]);
    console.log(`--- [GET] DB trả về ${rows.length} dòng`);

    const scheduleResult = {};
    const dayOfWeekNames = [
      'Chủ Nhật',
      'Thứ 2',
      'Thứ 3',
      'Thứ 4',
      'Thứ 5',
      'Thứ 6',
      'Thứ 7',
    ];

    for (const row of rows) {
      const d = new Date(row.schedule_date);
      const day = String(d.getDate()).padStart(2, '0');
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const dateKey = `${dayOfWeekNames[d.getDay()]} (${day}/${month})`;

      if (!scheduleResult[dateKey]) {
        scheduleResult[dateKey] = [];
      }

      const { schedule_date, ...scheduleItem } = row;
      scheduleResult[dateKey].push(scheduleItem);
    }

    res.json(scheduleResult);
  } catch (err) {
    console.error(
      '--- ❌ [GET /api/schedules] Lỗi:',
      err.sqlMessage || err.message
    );
    res.status(500).json({ error: 'Lỗi máy chủ' });
  }
});

/* ==========================================================
 * POST /api/schedules
 *  -> Lưu lịch tuần
 *  ❌ Không xóa nguyên tuần nữa
 *  ✅ UPSERT từng ô bằng (bus_id + schedule_date)
 * ========================================================== */
router.post('/', async (req, res) => {
  const { startDate, endDate, schedules } = req.body;

  console.log(
    '--- [POST /api/schedules] Lưu lịch từ',
    startDate,
    'đến',
    endDate
  );
  console.log(
    '--- Số ô lịch nhận được:',
    Array.isArray(schedules) ? schedules.length : 0
  );

  if (!startDate || !endDate || !Array.isArray(schedules)) {
    return res
      .status(400)
      .json({ error: 'Thiếu dữ liệu đầu vào (startDate/endDate/schedules)' });
  }

  let connection;
  try {
    connection = await pool.getConnection();
    await connection.beginTransaction();

    // Câu UPSERT: nếu schedule_id chưa có -> INSERT, nếu trùng -> UPDATE
    const upsertSql = `
      INSERT INTO \`bus_schedule\`
        (schedule_id, route_id, bus_id, driver_id, schedule_date, start_time, end_time)
      VALUES (?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        route_id      = VALUES(route_id),
        bus_id        = VALUES(bus_id),
        driver_id     = VALUES(driver_id),
        schedule_date = VALUES(schedule_date),
        start_time    = VALUES(start_time),
        end_time      = VALUES(end_time)
    `;

    // Lặp qua từng ô lịch frontend gửi lên
    for (const schedule of schedules) {
      const { bus_id, driver_id, schedule_date } = schedule;

      if (!bus_id || !schedule_date) {
        console.warn(
          '--- Bỏ qua 1 bản ghi thiếu bus_id hoặc schedule_date:',
          schedule
        );
        continue;
      }

      // 1. Lấy route_id mặc định từ bảng bus (nếu có)
      const [busRows] = await connection.query(
        'SELECT `default_route_id` FROM `bus` WHERE `bus_id` = ?',
        [bus_id]
      );

      let route_id = null;
      if (busRows.length > 0 && busRows[0].default_route_id) {
        route_id = busRows[0].default_route_id;
      }

      // 2. Giờ chạy: tạm cố định, sau này bạn có thể cho nhập từ UI
      const start_time = '06:00:00';
      const end_time = '12:00:00';

      // 3. Khóa chính: 1 xe + 1 ngày = 1 schedule_id duy nhất
      const schedule_id = `${bus_id}-${schedule_date}`;
      // Ví dụ: "XE001-2025-11-10"

      // 4. UPSERT vào DB
      await connection.query(upsertSql, [
        schedule_id,
        route_id,
        bus_id,
        driver_id || null, // nếu user chọn "-- Chọn tài xế --" thì driver_id = null
        schedule_date,
        start_time,
        end_time,
      ]);
    }

    await connection.commit();
    connection.release();

    console.log('--- ✅ [POST /api/schedules] Lưu lịch tuần thành công');
    res.json({ message: 'Lưu lịch tuần thành công!' });
  } catch (err) {
    if (connection) {
      await connection.rollback();
      connection.release();
    }
    console.error(
      '--- ❌ [POST /api/schedules] Lỗi:',
      err.sqlMessage || err.message
    );
    res.status(500).json({ error: 'Lỗi máy chủ khi lưu lịch tuần' });
  }
});
router.post('/generate-fast-match', async (req, res) => {
    // 1. Lấy daysOfWeek (chứa 7 ngày) từ frontend gửi lên
    const { daysOfWeek } = req.body;

    if (!Array.isArray(daysOfWeek) || daysOfWeek.length !== 7) {
        return res.status(400).json({ error: 'Dữ liệu daysOfWeek không hợp lệ.' });
    }

    let connection;
    try {
        connection = await pool.getConnection();

        // 2. Lấy dữ liệu thô từ DB, chỉ lấy tài xế "Rảnh"
        const [drivers] = await connection.query("SELECT driver_id, name, work_schedule, status FROM driver WHERE status = 'Rảnh'");
        const [vehicles] = await connection.query("SELECT bus_id as id FROM bus");
        
        // 3. Chạy thuật toán xếp lịch (y hệt logic cũ ở frontend)
        let driverPool = drivers.map(d => ({
            ...d,
            // (Đổi tên cột id cho khớp)
            id: d.driver_id, 
            availableShifts: d.work_schedule ? d.work_schedule.split(',') : [],
            assignedCount: 0
        }));

        const newMatrix = {}; // Kết quả ma trận chi tiết
        const fastAssignSummary = {}; // Kết quả tóm tắt
        
        // Khởi tạo các đối tượng
        for (const vehicle of vehicles) {
            newMatrix[vehicle.id] = {};
        }
        for (const day of daysOfWeek) {
            // Dùng mảng [ ] (JSON-friendly) thay vì Map
            fastAssignSummary[day.key] = []; 
        }

        // 4. Lặp qua từng ngày
        for (const day of daysOfWeek) {
            const dayKey = day.key; 

            let availableDriversToday = driverPool.filter(d => 
                d.availableShifts.includes(dayKey)
                // (status='Rảnh' đã được lọc ở câu SQL)
            );
            
            availableDriversToday.sort((a, b) => a.assignedCount - b.assignedCount);
            let driverIndex = 0;

            // 5. Lặp qua từng xe
            for (const vehicle of vehicles) {
                if (driverIndex < availableDriversToday.length) {
                    const driverToAssign = availableDriversToday[driverIndex];
                    
                    // Gán vào ma trận
                    newMatrix[vehicle.id][dayKey] = driverToAssign.id;
                    
                    // Cập nhật số ca
                    driverToAssign.assignedCount++;
                    driverIndex++;
                    
                    // Thêm vào tóm tắt (chỉ thêm 1 lần)
                    const isAlreadyInSummary = fastAssignSummary[dayKey].some(d => d.id === driverToAssign.id);
                    if (!isAlreadyInSummary) {
                        fastAssignSummary[dayKey].push({
                            id: driverToAssign.id,
                            name: driverToAssign.name
                        });
                    }
                    
                } else {
                    newMatrix[vehicle.id][dayKey] = null; 
                }
            }
        }
        
        connection.release();

        // 6. Trả về kết quả cho frontend
        res.json({ newMatrix, fastAssignSummary });

    } catch (err) {
        if (connection) connection.release();
        console.error("Lỗi khi tạo lịch nhanh:", err.sqlMessage || err.message);
        res.status(500).json({ error: 'Lỗi máy chủ khi đang tạo lịch.' });
    }
});

module.exports = router;
