// File: backend/route/notification.js
const express = require('express');
const router = express.Router();
const pool = require('../db.js'); 

/* ==========================================================
 * [GET] /api/notifications/users/:role
 * Lấy danh sách ID và Tên (Tài xế/Phụ huynh)
 * ========================================================== */
router.get('/users/:role', async (req, res) => {
    const { role } = req.params;
    try {
        let sql = "";
        if (role === 'driver') {
            sql = "SELECT driver_id as id, name FROM driver"; 
        } else if (role === 'parent') {
            sql = "SELECT parent_id as id, name FROM parent"; 
        } else {
            return res.json([]);
        }
        
        const [users] = await pool.query(sql);
        res.json(users);
    } catch (err) {
        console.error("Lỗi lấy danh sách user:", err);
        res.status(500).json({ message: 'Lỗi lấy danh sách user' });
    }
});

/* ==========================================================
 * [POST] /api/notifications
 * TẠO THÔNG BÁO MỚI
 * ========================================================== */
router.post('/', async (req, res) => {
  const { recipient, title, content, type, scheduledTime, isRecurring, specificIds, recurrenceDays } = req.body;
  
  if (!recipient || !title || !content) {
      return res.status(400).json({ message: 'Vui lòng nhập đủ: Gửi đến, Tiêu đề, Nội dung' });
  }

  let connection;
  try {
    connection = await pool.getConnection();
    await connection.beginTransaction();

    // 1. Xử lý dữ liệu
    const notifType = type || 'manual';
    const sentStatus = notifType === 'scheduled' ? 'pending' : 'sent'; 
    const timeValue = notifType === 'scheduled' ? new Date(scheduledTime) : null; 

    let daysString = null;
    if (isRecurring && recurrenceDays && recurrenceDays.length > 0) {
        daysString = recurrenceDays.join(',');
    }

    // 2. Lưu vào bảng `notification`
    // ĐÃ SỬA: Bỏ cột 'sender_id' ra khỏi câu lệnh INSERT
    const sqlNotif = `
      INSERT INTO notification 
      (recipient_type, title, content, type, scheduled_time, is_recurring, recurrence_days, status_sent, created_at, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), 'unread')
    `;
    
    const [result] = await connection.query(sqlNotif, [
        recipient, 
        title, 
        content, 
        notifType, 
        timeValue, 
        isRecurring ? 1 : 0,
        daysString,
        sentStatus
    ]);
    const newNotificationId = result.insertId;

    // 3. Xử lý người nhận (Nếu là Gửi ngay)
    if (notifType === 'manual') {
        let finalRecipientIds = [];

        if (recipient === 'bus') {
            finalRecipientIds = ['admin'];
        } else {
            if (specificIds && Array.isArray(specificIds) && specificIds.length > 0) {
                finalRecipientIds = specificIds;
            } else {
                if (recipient === 'driver') {
                    const [drivers] = await connection.query("SELECT driver_id FROM driver");
                    finalRecipientIds = drivers.map(d => d.driver_id);
                } else if (recipient === 'parent') {
                    const [parents] = await connection.query("SELECT parent_id FROM parent");
                    finalRecipientIds = parents.map(p => p.parent_id);
                }
            }
        }

        if (finalRecipientIds.length > 0) {
            const sqlRecipient = `
                INSERT INTO notification_recipients 
                (notification_id, recipient_id, recipient_type, status)
                VALUES ?
            `;
            const recipientData = finalRecipientIds.map(id => [
                newNotificationId,
                id,
                recipient === 'bus' ? 'admin' : recipient,
                'unread'
            ]);
            await connection.query(sqlRecipient, [recipientData]);
        }
    }

    await connection.commit();
    connection.release();
    
    res.status(201).json({ 
      message: notifType === 'scheduled' ? 'Đã lên lịch thông báo thành công.' : 'Đã gửi thông báo thành công.',
      notificationId: newNotificationId
    });

  } catch (err) {
    if (connection) { await connection.rollback(); connection.release(); }
    console.error("Lỗi tạo thông báo:", err);
    return res.status(500).json({ message: 'Lỗi server khi tạo thông báo' });
  }
});

/* ==========================================================
 * [GET] /api/notifications
 * Lấy danh sách thông báo (CÓ BỘ LỌC)
 * ========================================================== */
router.get('/', async (req, res) => {
  try {
    const { type, status } = req.query; 
    let sql = "SELECT * FROM notification WHERE 1=1";
    const params = [];

    // 1. Lọc theo Tab (Xe buýt / Tài xế / Phụ huynh)
    if (type && type !== 'all') {
        sql += " AND recipient_type = ?";
        params.push(type);
    }

    // 2. Lọc theo Trạng thái (Chưa xem / Đã xem)
    if (status) {
        sql += " AND status = ?";
        params.push(status);
    }

    sql += " ORDER BY created_at DESC";

    const [notifications] = await pool.query(sql, params);
    res.json(notifications);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Lỗi server khi lấy danh sách' });
  }
});

/* ==========================================================
 * [PATCH] /api/notifications/:id/read
 * Đánh dấu đã xem
 * ========================================================== */
router.patch('/:id/read', async (req, res) => {
    try {
        await pool.query("UPDATE notification SET status = 'read' WHERE id = ?", [req.params.id]);
        res.json({ message: 'Đã xem' });
    } catch (e) { 
        res.status(500).json({message:'Lỗi'}); 
    }
});

/* ==========================================================
 * [GET] /api/notifications/:id/recipients
 * Xem chi tiết người nhận
 * ========================================================== */
router.get('/:id/recipients', async (req, res) => {
    try {
        const sql = `
            SELECT recipient_id, recipient_type, status 
            FROM notification_recipients 
            WHERE notification_id = ?
        `;
        const [rows] = await pool.query(sql, [req.params.id]);
        res.json(rows);
    } catch (e) { 
        res.status(500).json({message:'Lỗi'}); 
    }
});

module.exports = router;