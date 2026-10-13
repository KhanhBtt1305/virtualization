// routes/studentRoutes.js
const express = require('express');
const router = express.Router();
const studentController = require("../controllers/studentController");

// Lấy tất cả học sinh
router.get('/students', studentController.getAllStudents);

// Tìm kiếm học sinh
router.get('/search', studentController.searchStudents);

// Lấy thống kê học sinh
router.get('/statistics', studentController.getStudentStatistics);

// Lấy học sinh theo ID
router.get('/:id', studentController.getStudentById);

// Lấy học sinh với lịch đón
router.get('/:id/with-schedule', studentController.getStudentWithSchedule);

// Lấy học sinh theo phụ huynh
router.get('/parent/:parentId', studentController.getStudentsByParent);

// Lấy học sinh theo điểm đón
router.get('/stop/pickup/:stopId', studentController.getStudentsByPickupStop);

// Lấy học sinh theo trường
router.get('/school/:schoolName', studentController.getStudentsBySchool);

// Tạo học sinh mới
router.post('/', studentController.createStudent);

// Cập nhật học sinh
router.put('/:id', studentController.updateStudent);

// Xóa học sinh
router.delete('/:id', studentController.deleteStudent);

module.exports = router;