// controllers/studentController.js
const studentRepository = require('../models/StudentModel');

const studentController = {
  /**
   * Lấy tất cả học sinh
   */
  getAllStudents: async (req, res) => {
    try {
      const students = await studentRepository.getAllStudents();
      res.json({
        success: true,
        data: students,
        count: students.length
      });
    } catch (error) {
      console.error('Error in getAllStudents controller:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi khi lấy danh sách học sinh',
        error: error.message
      });
    }
  },

  /**
   * Lấy học sinh theo ID
   */
  getStudentById: async (req, res) => {
    try {
      const { id } = req.params;
      const student = await studentRepository.getStudentById(id);
      
      if (!student) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy học sinh'
        });
      }

      res.json({
        success: true,
        data: student
      });
    } catch (error) {
      console.error('Error in getStudentById controller:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi khi lấy thông tin học sinh',
        error: error.message
      });
    }
  },

  /**
   * Lấy học sinh theo phụ huynh
   */
  getStudentsByParent: async (req, res) => {
    try {
      const { parentId } = req.params;
      const students = await studentRepository.getStudentsByParent(parentId);
      
      res.json({
        success: true,
        data: students,
        count: students.length,
        parentId: parentId
      });
    } catch (error) {
      console.error('Error in getStudentsByParent controller:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi khi lấy học sinh theo phụ huynh',
        error: error.message
      });
    }
  },

  /**
   * Lấy học sinh theo điểm đón
   */
  getStudentsByPickupStop: async (req, res) => {
    try {
      const { stopId } = req.params;
      const students = await studentRepository.getStudentsByPickupStop(stopId);
      
      res.json({
        success: true,
        data: students,
        count: students.length,
        stopId: stopId
      });
    } catch (error) {
      console.error('Error in getStudentsByPickupStop controller:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi khi lấy học sinh theo điểm đón',
        error: error.message
      });
    }
  },

  /**
   * Lấy học sinh theo trường
   */
  getStudentsBySchool: async (req, res) => {
    try {
      const { schoolName } = req.params;
      const students = await studentRepository.getStudentsBySchool(schoolName);
      
      res.json({
        success: true,
        data: students,
        count: students.length,
        schoolName: schoolName
      });
    } catch (error) {
      console.error('Error in getStudentsBySchool controller:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi khi lấy học sinh theo trường',
        error: error.message
      });
    }
  },

  /**
   * Tạo học sinh mới
   */
  createStudent: async (req, res) => {
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
          message: 'Thiếu thông tin bắt buộc (student_id, name, school_name, class_name)'
        });
      }

      // Kiểm tra học sinh đã tồn tại chưa
      const studentExists = await studentRepository.isStudentExists(student_id);
      if (studentExists) {
        return res.status(400).json({
          success: false,
          message: 'Mã học sinh đã tồn tại'
        });
      }

      // Tạo học sinh mới
      const newStudent = await studentRepository.createStudent({
        student_id,
        parent_id,
        stop_id,
        dropoff_stop_id,
        name,
        school_name,
        class_name,
        gender
      });

      res.status(201).json({
        success: true,
        message: 'Tạo học sinh thành công',
        data: newStudent
      });
    } catch (error) {
      console.error('Error in createStudent controller:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi khi tạo học sinh',
        error: error.message
      });
    }
  },

  /**
   * Cập nhật học sinh
   */
  updateStudent: async (req, res) => {
    try {
      const { id } = req.params;
      const studentData = req.body;

      // Kiểm tra học sinh có tồn tại không
      const studentExists = await studentRepository.isStudentExists(id);
      if (!studentExists) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy học sinh'
        });
      }

      // Cập nhật học sinh
      const updatedStudent = await studentRepository.updateStudent(id, studentData);

      res.json({
        success: true,
        message: 'Cập nhật học sinh thành công',
        data: updatedStudent
      });
    } catch (error) {
      console.error('Error in updateStudent controller:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi khi cập nhật học sinh',
        error: error.message
      });
    }
  },

  /**
   * Xóa học sinh
   */
  deleteStudent: async (req, res) => {
    try {
      const { id } = req.params;

      // Kiểm tra học sinh có tồn tại không
      const studentExists = await studentRepository.isStudentExists(id);
      if (!studentExists) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy học sinh'
        });
      }

      // Xóa học sinh
      const deleted = await studentRepository.deleteStudent(id);

      if (deleted) {
        res.json({
          success: true,
          message: 'Xóa học sinh thành công'
        });
      } else {
        res.status(500).json({
          success: false,
          message: 'Không thể xóa học sinh'
        });
      }
    } catch (error) {
      console.error('Error in deleteStudent controller:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi khi xóa học sinh',
        error: error.message
      });
    }
  },

  /**
   * Tìm kiếm học sinh
   */
  searchStudents: async (req, res) => {
    try {
      const { keyword } = req.query;
      
      if (!keyword || keyword.trim() === '') {
        return res.status(400).json({
          success: false,
          message: 'Vui lòng nhập từ khóa tìm kiếm'
        });
      }

      const students = await studentRepository.searchStudents(keyword.trim());
      
      res.json({
        success: true,
        data: students,
        count: students.length,
        keyword: keyword
      });
    } catch (error) {
      console.error('Error in searchStudents controller:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi khi tìm kiếm học sinh',
        error: error.message
      });
    }
  },

  /**
   * Lấy thống kê học sinh
   */
  getStudentStatistics: async (req, res) => {
    try {
      const totalStudents = await studentRepository.countStudents();
      
      // Thống kê theo giới tính
      const [genderStats] = await pool.execute(`
        SELECT 
          gender,
          COUNT(*) as count,
          ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM student), 2) as percentage
        FROM student 
        GROUP BY gender
      `);

      // Thống kê theo trường
      const [schoolStats] = await pool.execute(`
        SELECT 
          school_name,
          COUNT(*) as count
        FROM student 
        GROUP BY school_name
        ORDER BY count DESC
      `);

      // Thống kê theo lớp
      const [classStats] = await pool.execute(`
        SELECT 
          class_name,
          COUNT(*) as count
        FROM student 
        GROUP BY class_name
        ORDER BY class_name
      `);

      res.json({
        success: true,
        data: {
          totalStudents,
          genderStats,
          schoolStats,
          classStats
        }
      });
    } catch (error) {
      console.error('Error in getStudentStatistics controller:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi khi lấy thống kê học sinh',
        error: error.message
      });
    }
  },

  /**
   * Lấy học sinh với lịch đón
   */
  getStudentWithSchedule: async (req, res) => {
    try {
      const { id } = req.params;
      const studentWithSchedule = await studentRepository.getStudentWithPickupSchedule(id);
      
      if (!studentWithSchedule) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy học sinh'
        });
      }

      res.json({
        success: true,
        data: studentWithSchedule
      });
    } catch (error) {
      console.error('Error in getStudentWithSchedule controller:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi khi lấy thông tin học sinh và lịch đón',
        error: error.message
      });
    }
  }
};

module.exports = studentController;