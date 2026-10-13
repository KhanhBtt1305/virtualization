const express = require('express');
const mysql = require('mysql');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'bus_map'
});

db.connect((err) => {
    if (err) {
        console.error('Lỗi kết nối Database:', err.code);
    } else {
        console.log('--- Đã kết nối Database thành công! ---');
    }
});

const STOP_COORDINATES = {
    // --- Khu vực Quận 5 (Tuyến R01, TD1) ---
    'STOP1':   { lat: 10.75992, lng: 106.68226 }, // ĐH Sài Gòn (An Dương Vương)
    'STOP_T1': { lat: 10.75992, lng: 106.68226 },
    'STOP2':   { lat: 10.75545, lng: 106.66487 }, // BV ĐH Y Dược
    'STOP_T2': { lat: 10.75545, lng: 106.66487 },
    'STOP4':   { lat: 10.75200, lng: 106.66000 }, // Hùng Vương
    'STOP5':   { lat: 10.76260, lng: 106.68000 }, // Cơ sở 2
    'STOP_T3': { lat: 10.76260, lng: 106.68000 },
    'STOP6':   { lat: 10.76295, lng: 106.68205 }, // KHTN

    // --- Khu vực Quận 1 (Tuyến TD2, TD3) ---
    'STOP3':   { lat: 10.78775, lng: 106.70517 }, // Thảo Cầm Viên
    'STOP11':  { lat: 10.77192, lng: 106.66850 }, // Sư Vạn Hạnh
    'STOP12':  { lat: 10.76865, lng: 106.70624 }, // Bến Nhà Rồng

    // --- Tọa độ mặc định (Nếu không tìm thấy ID) ---
    'DEFAULT': { lat: 10.77690, lng: 106.70090 }  
};

// Đăng nhập
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    
    // Tìm trong bảng users trước
    const sqlUser = "SELECT * FROM users WHERE username = ? AND password = ?";
    
    db.query(sqlUser, [username, password], (err, results) => {
        if (err) return res.status(500).json(err);
        
        if (results.length > 0) {
            const userAccount = results[0];
            
            // Nếu là phụ huynh, lấy thêm tên thật từ bảng parent
            if (userAccount.role === 'parent') {
                const sqlParent = "SELECT parent_id, name FROM parent WHERE user_id = ?";
                db.query(sqlParent, [userAccount.user_id], (errP, resP) => {
                    if (resP && resP.length > 0) {
                        res.json({ 
                            success: true, 
                            user: { 
                                username: resP[0].name, 
                                role: 'parent', 
                                linked_id: resP[0].parent_id 
                            } 
                        });
                    } else {
                        res.json({ 
                            success: true, 
                            user: { 
                                username: userAccount.username, 
                                role: 'parent', 
                                linked_id: null 
                            } 
                        });
                    }
                });
            } else {
                // Các role khác (driver, admin)
                res.json({ 
                    success: true, 
                    user: { 
                        username: userAccount.username, 
                        role: userAccount.role, 
                        linked_id: userAccount.linked_id 
                    } 
                });
            }
        } else {
             res.status(401).json({ success: false, message: "Sai tài khoản hoặc mật khẩu" });
        }
    });
});

// Lấy thông tin Profile
app.get('/api/profile', (req, res) => {
    const parentId = req.query.id;
    db.query("SELECT * FROM parent WHERE parent_id = ?", [parentId], (err, data) => {
        if (err) return res.status(500).json(err);
        res.json(data[0] || {});
    });
});

// Cập nhật Profile
app.put('/api/profile', (req, res) => { 
    const { name, phone, email, age, sex, parent_id } = req.body; 
    const sql = "UPDATE parent SET name=?, phone=?, email=?, age=?, sex=? WHERE parent_id=?";
    
    db.query(sql, [name, phone, email, age, sex, parent_id], (err) => {
        if(err) return res.status(500).json(err);
        res.json({ message: "Cập nhật thành công" }); 
    }); 
});

// Lấy danh sách học sinh
app.get('/api/students', (req, res) => {
    const sql = "SELECT student_id, parent_id, name, class_name as class, school_name, gender FROM student";
    db.query(sql, (err, data) => {
        if (err) return res.status(500).json(err);
        res.json(data);
    });
});

// Thêm học sinh mới
app.post('/api/students', (req, res) => { 
    const id = 'HS' + Date.now().toString().slice(-5); // Tạo ID ngẫu nhiên
    const { name, studentClass, school, gender, parent_id } = req.body;
    const sql = "INSERT INTO student (student_id, parent_id, name, class_name, school_name, gender) VALUES (?, ?, ?, ?, ?, ?)";

    db.query(sql, [id, parent_id, name, studentClass, school, gender], (err) => {
        if(err) return res.status(500).json(err);
        res.json({ message: "Đã thêm học sinh", student_id: id }); 
    }); 
});

// Xóa học sinh
app.delete('/api/students/:id', (req, res) => {
    db.query("DELETE FROM student WHERE student_id = ?", [req.params.id], (err) => {
        if (err) return res.status(500).json(err);
        res.json({ message: "Đã xóa thành công" });
    });
});

// [MAP] Lấy danh sách trạm của 1 tuyến (Kèm tọa độ để vẽ đường)
app.get('/api/route-path', (req, res) => { 
    const routeId = req.query.id || 'R01';
    const sql = "SELECT stop_id, stop_name, address FROM bus_stop WHERE route_id = ? ORDER BY stop_order ASC";

    db.query(sql, [routeId], (err, stops) => {
        if (err) return res.json([]);
        
        // --- LOGIC GHÉP TỌA ĐỘ ---
        const pathData = stops.map(stop => {
            // Lấy tọa độ từ biến STOP_COORDINATES định nghĩa ở đầu file
            const coords = STOP_COORDINATES[stop.stop_id] || STOP_COORDINATES['DEFAULT'];
            return [coords.lat, coords.lng]; 
        });
        
        res.json(pathData);
    }); 
});

// [MAP] Lấy danh sách xe đang chạy (Active) của 1 tuyến
// API này trả về list xe, Frontend sẽ tự tính toán animation di chuyển
app.get('/api/bus-locations', (req, res) => {
    const routeId = req.query.routeId;
    
    let sql = "SELECT bus_id, license_plate, default_route_id FROM bus WHERE status = 'Đang hoạt động'";
    
    // Nếu có yêu cầu lọc theo tuyến, thêm điều kiện WHERE
    if (routeId) {
        sql += ` AND default_route_id = '${routeId}'`;
    }

    db.query(sql, (err, buses) => {
        if (err) return res.json([]);
        res.json(buses);
    });
});

// [INFO] Lấy thông tin chung của tuyến (Tên tuyến, trạng thái...)
app.get('/api/bus-info-by-route', (req, res) => {
    const routeId = req.query.id;
    const sql = `
        SELECT b.license_plate, b.status, r.route_name 
        FROM bus b 
        JOIN route r ON b.default_route_id = r.route_id 
        WHERE r.route_id = ? AND b.status = 'Đang hoạt động' 
        LIMIT 1
    `;
    db.query(sql, [routeId], (err, data) => {
        if (err) return res.json({});
        res.json(data[0] || {});
    });
});

// Lấy danh sách tất cả các tuyến
app.get('/api/routes', (req, res) => {
    db.query("SELECT * FROM route", (err, data) => {
        if (err) return res.status(500).json(err);
        res.json(data);
    });
});

// Lấy danh sách xe đang hoạt động (cho Dropdown chọn xe)
app.get('/api/active-buses-by-route', (req, res) => { 
    const sql = "SELECT bus_id, license_plate FROM bus WHERE default_route_id = ? AND status = 'Đang hoạt động'";
    db.query(sql, [req.query.id], (err, data) => res.json(err || data)); 
});

// Lấy thông tin lịch trình (Tài xế, giờ chạy)
app.get('/api/bus-schedule-info', (req, res) => { 
    const sql = `
        SELECT d.name, d.phone, d.driver_id, s.start_time, s.schedule_id, s.schedule_date 
        FROM bus_schedule s 
        JOIN driver d ON s.driver_id = d.driver_id 
        WHERE s.bus_id = ? 
        ORDER BY ABS(DATEDIFF(s.schedule_date, NOW())) ASC, s.start_time ASC 
        LIMIT 1
    `; 
    db.query(sql, [req.query.busId], (err, data) => res.json(err || data[0] || {})); 
});

// Lấy danh sách điểm danh học sinh (Đã/Chưa lên xe)
app.get('/api/route-students-status', (req, res) => {
    const { id, parentId, scheduleId } = req.query;

    // Trường hợp 1: Chưa có lịch trình (chỉ hiện danh sách học sinh của tuyến)
    if (!scheduleId) {
        let sql = `
            SELECT st.student_id, st.name, st.class_name as class, bs.stop_name, bs.stop_id, 'CHO_DON' as pickup_status 
            FROM student st 
            JOIN bus_stop bs ON st.stop_id = bs.stop_id 
            WHERE bs.route_id = ?
        `;
        if (parentId) sql += " AND st.parent_id = ?";
        
        db.query(sql, parentId ? [id, parentId] : [id], (err, data) => res.json(err || data));
        return;
    }

    // Trường hợp 2: Đã có lịch trình (hiện trạng thái đón thực tế)
    let sql = `
        SELECT st.student_id, st.name, st.class_name as class, bs.stop_name, bs.stop_id, 
               COALESCE(sp.status, 'CHO_DON') as pickup_status, 
               sp.schedule_id 
        FROM student st 
        JOIN bus_stop bs ON st.stop_id = bs.stop_id 
        LEFT JOIN student_pickup sp ON st.student_id = sp.student_id AND sp.schedule_id = ? 
        WHERE bs.route_id = ?
    `;
    
    const params = [scheduleId, id];
    if (parentId) { 
        sql += " AND st.parent_id = ?"; 
        params.push(parentId); 
    }
    
    db.query(sql, params, (err, data) => res.json(err || data));
});

// Cập nhật trạng thái đón (Đã lên xe / Đã xuống xe...)
app.post('/api/update-student-status', (req, res) => {
    const { student_id, status, driver_id, stop_id, schedule_id } = req.body;
    
    if (!schedule_id) return res.status(400).json({ error: "Thiếu schedule_id" });

    // Kiểm tra xem đã có bản ghi chưa
    const checkSql = "SELECT pickup_id FROM student_pickup WHERE student_id = ? AND schedule_id = ?";
    
    db.query(checkSql, [student_id, schedule_id], (err, results) => {
        if (results.length > 0) {
            // Đã có -> Update
            const updateSql = "UPDATE student_pickup SET status = ?, stop_id = ?, driver_id = ?, pickup_time = NOW() WHERE pickup_id = ?";
            db.query(updateSql, [status, stop_id, driver_id, results[0].pickup_id], () => res.json({message: "Updated"}));
        } else {
            // Chưa có -> Insert
            const pid = 'DT' + Date.now();
            const insertSql = `INSERT INTO student_pickup (pickup_id, student_id, driver_id, schedule_id, pickup_time, status, stop_id) VALUES (?, ?, ?, ?, NOW(), ?, ?)`;
            db.query(insertSql, [pid, student_id, driver_id, schedule_id, status, stop_id], () => res.json({message: "Inserted"}));
        }
    });
});

// Lấy chi tiết text cho trang Route Detail
app.get('/api/route-detail', (req, res) => { 
    db.query("SELECT r.route_name, r.start_point, r.end_point, s.stop_name, s.address, s.stop_id FROM route r JOIN bus_stop s ON r.route_id = s.route_id WHERE r.route_id = ? ORDER BY s.stop_order ASC", 
    [req.query.id], (err, data) => res.json(err || data)); 
});

app.get('/api/home-summary', (req, res) => {
    // Nếu là admin (không có parentId)
    if (!req.query.parentId) {
        const sqlAdmin = "SELECT b.license_plate, b.status, b.bus_id, r.route_name, r.route_id FROM bus b LEFT JOIN route r ON b.default_route_id = r.route_id WHERE b.status = 'Đang hoạt động' LIMIT 1";
        return db.query(sqlAdmin, (err, data) => res.json(err || data[0] || {}));
    }
    
    // Nếu là phụ huynh (lọc theo con)
    const sqlParent = `
        SELECT DISTINCT b.license_plate, b.status, b.bus_id, r.route_name, r.route_id 
        FROM parent p 
        JOIN student s ON p.parent_id = s.parent_id 
        JOIN bus_stop bs ON s.stop_id = bs.stop_id 
        JOIN route r ON bs.route_id = r.route_id 
        LEFT JOIN bus b ON r.route_id = b.default_route_id 
        WHERE p.parent_id = ? AND b.status = 'Đang hoạt động' 
        LIMIT 1`;
        
    db.query(sqlParent, [req.query.parentId], (err, data) => res.json(data && data.length > 0 ? data[0] : {}));
});

// API Thông báo
app.get('/api/notifications', (req, res) => {
    db.query("SELECT * FROM notification WHERE recipient_type = 'parent' OR recipient_type = 'system' ORDER BY created_at DESC", (err, data) => res.json(err || data));
});

app.put('/api/notifications/:id', (req, res) => {
    db.query("UPDATE notification SET status = ? WHERE id = ?", [req.body.status, req.params.id], (err) => res.json(err || {msg:"ok"}));
});

app.put('/api/notifications-mark-all', (req, res) => {
    db.query("UPDATE notification SET status = 'read' WHERE recipient_type = 'parent'", (err) => res.json(err || {msg:"ok"}));
});

app.delete('/api/notifications/:id', (req, res) => {
    db.query("DELETE FROM notification WHERE id = ?", [req.params.id], (err) => res.json(err || {msg:"ok"}));
});

const PORT = 8081;
app.listen(PORT, () => {
    console.log(`=============================================`);
    console.log(`Server BusMap đang chạy tại: http://localhost:${PORT}`);
    console.log(`=============================================`);
});