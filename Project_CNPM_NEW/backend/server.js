const express = require('express');
const cors = require('cors');

// 1. Import file route
const studentRoutes = require('./route/student.js');
const signinRoute = require('./signinRoute');
const vehicleRoutes = require('./routes/vehicleRoutes');
const thongKeRoutes = require('./routes/thongKeRoutes'); // import route thống kê
const driverRoutes = require('./route/driver.js');
const busRoutes = require('./route/bus.js');
const scheduleRoutes = require('./route/schedule.js');
const routeRoutes = require('./route/route.js');
const notificationRoutes = require('./route/notification.js');
const app = express();
const PORT = process.env.PORT||5000; 

// Middleware
app.use(cors({
  origin: [
    "http://localhost:3000",
    "http://localhost:5001",
    "http://localhost:5173",
    process.env.CORS_ORIGIN||"http://localhost:5000"
  ],
  credentials: true
}));
app.use(express.json());

// 2. Chỉ dẫn cho server: 
app.use('/api', signinRoute);
// http://localhost:5000/api/vehicle/routes
// http://localhost:5000/api/vehicle/route/TD1
// http://localhost:5000/api/thongke

app.use('/api/vehicle', vehicleRoutes);
app.use('/api/thongke', thongKeRoutes);
app.use('/api/drivers', driverRoutes);
app.use('/api/buses', busRoutes);
app.use('/api/schedules', scheduleRoutes);
app.use('/api/routes', routeRoutes);
app.use('/api/notifications', notificationRoutes);

app.use('/api/students', studentRoutes);

/* ==================================================================
 * CRON JOB: TỰ ĐỘNG QUÉT VÀ GỬI THÔNG BÁO (CHẠY MỖI PHÚT)
 * ================================================================== */


// Khởi động server
app.listen(PORT, () => {
  console.log(`Backend server đang chạy tại http://localhost:${PORT}`);
});
