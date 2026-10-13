// repositories/studentRepository.js
const pool = require('../db');

const studentRepository = {
  /**
   * Lấy tất cả học sinh
   * @returns {Promise<Array>} Mảng học sinh
   */
  getAllStudents: async () => {
    try {
      const [rows] = await pool.execute(`
        SELECT 
          s.*,
          p.name as parent_name,
          p.phone as parent_phone,
          p.email as parent_email,
          bs1.stop_name as pickup_stop_name,
          bs2.stop_name as dropoff_stop_name
        FROM student s
        LEFT JOIN parent p ON s.parent_id = p.parent_id
        LEFT JOIN bus_stop bs1 ON s.stop_id = bs1.stop_id
        LEFT JOIN bus_stop bs2 ON s.dropoff_stop_id = bs2.stop_id
        ORDER BY s.student_id
      `);
      return rows;
    } catch (error) {
      console.error('Error in getAllStudents:', error);
      throw error;
    }
  },

  /**
   * Lấy học sinh theo ID
   * @param {string} studentId - ID học sinh
   * @returns {Promise<Object|null>} Thông tin học sinh
   */
  getStudentById: async (studentId) => {
    try {
      const [rows] = await pool.execute(
        `SELECT 
          s.*,
          p.name as parent_name,
          p.phone as parent_phone,
          p.email as parent_email,
          bs1.stop_name as pickup_stop_name,
          bs1.address as pickup_address,
          bs2.stop_name as dropoff_stop_name,
          bs2.address as dropoff_address
        FROM student s
        LEFT JOIN parent p ON s.parent_id = p.parent_id
        LEFT JOIN bus_stop bs1 ON s.stop_id = bs1.stop_id
        LEFT JOIN bus_stop bs2 ON s.dropoff_stop_id = bs2.stop_id
        WHERE s.student_id = ?`,
        [studentId]
      );
      return rows.length > 0 ? rows[0] : null;
    } catch (error) {
      console.error('Error in getStudentById:', error);
      throw error;
    }
  },

  /**
   * Lấy học sinh theo phụ huynh
   * @param {string} parentId - ID phụ huynh
   * @returns {Promise<Array>} Danh sách học sinh
   */
  getStudentsByParent: async (parentId) => {
    try {
      const [rows] = await pool.execute(
        `SELECT 
          s.*,
          bs1.stop_name as pickup_stop_name,
          bs2.stop_name as dropoff_stop_name
        FROM student s
        LEFT JOIN bus_stop bs1 ON s.stop_id = bs1.stop_id
        LEFT JOIN bus_stop bs2 ON s.dropoff_stop_id = bs2.stop_id
        WHERE s.parent_id = ?
        ORDER BY s.name`,
        [parentId]
      );
      return rows;
    } catch (error) {
      console.error('Error in getStudentsByParent:', error);
      throw error;
    }
  },

  /**
   * Lấy học sinh theo điểm đón
   * @param {string} stopId - ID điểm đón
   * @returns {Promise<Array>} Danh sách học sinh
   */
  getStudentsByPickupStop: async (stopId) => {
    try {
      const [rows] = await pool.execute(
        `SELECT 
          s.*,
          p.name as parent_name,
          p.phone as parent_phone
        FROM student s
        LEFT JOIN parent p ON s.parent_id = p.parent_id
        WHERE s.stop_id = ?
        ORDER BY s.name`,
        [stopId]
      );
      return rows;
    } catch (error) {
      console.error('Error in getStudentsByPickupStop:', error);
      throw error;
    }
  },

  /**
   * Lấy học sinh theo điểm trả
   * @param {string} stopId - ID điểm trả
   * @returns {Promise<Array>} Danh sách học sinh
   */
  getStudentsByDropoffStop: async (stopId) => {
    try {
      const [rows] = await pool.execute(
        `SELECT 
          s.*,
          p.name as parent_name,
          p.phone as parent_phone
        FROM student s
        LEFT JOIN parent p ON s.parent_id = p.parent_id
        WHERE s.dropoff_stop_id = ?
        ORDER BY s.name`,
        [stopId]
      );
      return rows;
    } catch (error) {
      console.error('Error in getStudentsByDropoffStop:', error);
      throw error;
    }
  },

  /**
   * Lấy học sinh theo trường
   * @param {string} schoolName - Tên trường
   * @returns {Promise<Array>} Danh sách học sinh
   */
  getStudentsBySchool: async (schoolName) => {
    try {
      const [rows] = await pool.execute(
        `SELECT 
          s.*,
          p.name as parent_name,
          p.phone as parent_phone,
          bs1.stop_name as pickup_stop_name,
          bs2.stop_name as dropoff_stop_name
        FROM student s
        LEFT JOIN parent p ON s.parent_id = p.parent_id
        LEFT JOIN bus_stop bs1 ON s.stop_id = bs1.stop_id
        LEFT JOIN bus_stop bs2 ON s.dropoff_stop_id = bs2.stop_id
        WHERE s.school_name LIKE ?
        ORDER BY s.class_name, s.name`,
        [`%${schoolName}%`]
      );
      return rows;
    } catch (error) {
      console.error('Error in getStudentsBySchool:', error);
      throw error;
    }
  },

  /**
   * Lấy học sinh theo lớp
   * @param {string} className - Tên lớp
   * @returns {Promise<Array>} Danh sách học sinh
   */
  getStudentsByClass: async (className) => {
    try {
      const [rows] = await pool.execute(
        `SELECT 
          s.*,
          p.name as parent_name,
          p.phone as parent_phone,
          bs1.stop_name as pickup_stop_name,
          bs2.stop_name as dropoff_stop_name
        FROM student s
        LEFT JOIN parent p ON s.parent_id = p.parent_id
        LEFT JOIN bus_stop bs1 ON s.stop_id = bs1.stop_id
        LEFT JOIN bus_stop bs2 ON s.dropoff_stop_id = bs2.stop_id
        WHERE s.class_name = ?
        ORDER BY s.name`,
        [className]
      );
      return rows;
    } catch (error) {
      console.error('Error in getStudentsByClass:', error);
      throw error;
    }
  },

  /**
   * Tạo học sinh mới
   * @param {Object} studentData - Dữ liệu học sinh
   * @returns {Promise<Object>} Học sinh đã tạo
   */
  createStudent: async (studentData) => {
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
      } = studentData;

      await pool.execute(
        `INSERT INTO student 
        (student_id, parent_id, stop_id, dropoff_stop_id, name, school_name, class_name, gender) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [student_id, parent_id, stop_id, dropoff_stop_id, name, school_name, class_name, gender]
      );

      return await studentRepository.getStudentById(student_id);
    } catch (error) {
      console.error('Error in createStudent:', error);
      throw error;
    }
  },

  /**
   * Cập nhật thông tin học sinh
   * @param {string} studentId - ID học sinh
   * @param {Object} studentData - Dữ liệu cần cập nhật
   * @returns {Promise<Object>} Học sinh đã cập nhật
   */
  updateStudent: async (studentId, studentData) => {
    try {
      const { 
        parent_id, 
        stop_id, 
        dropoff_stop_id, 
        name, 
        school_name, 
        class_name, 
        gender 
      } = studentData;

      await pool.execute(
        `UPDATE student SET 
          parent_id = ?,
          stop_id = ?,
          dropoff_stop_id = ?,
          name = ?,
          school_name = ?,
          class_name = ?,
          gender = ?
        WHERE student_id = ?`,
        [parent_id, stop_id, dropoff_stop_id, name, school_name, class_name, gender, studentId]
      );

      return await studentRepository.getStudentById(studentId);
    } catch (error) {
      console.error('Error in updateStudent:', error);
      throw error;
    }
  },

  /**
   * Xóa học sinh
   * @param {string} studentId - ID học sinh
   * @returns {Promise<boolean>} true nếu xóa thành công
   */
  deleteStudent: async (studentId) => {
    try {
      const [result] = await pool.execute(
        'DELETE FROM student WHERE student_id = ?',
        [studentId]
      );
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error in deleteStudent:', error);
      throw error;
    }
  },

  /**
   * Tìm kiếm học sinh
   * @param {string} keyword - Từ khóa tìm kiếm
   * @returns {Promise<Array>} Danh sách học sinh tìm thấy
   */
  searchStudents: async (keyword) => {
    try {
      const searchTerm = `%${keyword}%`;
      const [rows] = await pool.execute(
        `SELECT 
          s.*,
          p.name as parent_name,
          p.phone as parent_phone,
          bs1.stop_name as pickup_stop_name,
          bs2.stop_name as dropoff_stop_name
        FROM student s
        LEFT JOIN parent p ON s.parent_id = p.parent_id
        LEFT JOIN bus_stop bs1 ON s.stop_id = bs1.stop_id
        LEFT JOIN bus_stop bs2 ON s.dropoff_stop_id = bs2.stop_id
        WHERE s.name LIKE ? 
          OR s.student_id LIKE ? 
          OR s.school_name LIKE ? 
          OR s.class_name LIKE ?
          OR p.name LIKE ?
        ORDER BY s.name`,
        [searchTerm, searchTerm, searchTerm, searchTerm, searchTerm]
      );
      return rows;
    } catch (error) {
      console.error('Error in searchStudents:', error);
      throw error;
    }
  },

  /**
   * Đếm tổng số học sinh
   * @returns {Promise<number>} Tổng số học sinh
   */
  countStudents: async () => {
    try {
      const [rows] = await pool.execute('SELECT COUNT(*) as count FROM student');
      return rows[0].count;
    } catch (error) {
      console.error('Error in countStudents:', error);
      throw error;
    }
  },

  /**
   * Lấy học sinh với lịch đón gần đây
   * @param {string} studentId - ID học sinh
   * @returns {Promise<Object>} Thông tin học sinh và lịch đón
   */
  getStudentWithPickupSchedule: async (studentId) => {
    try {
      const student = await studentRepository.getStudentById(studentId);
      if (!student) return null;

      const [pickupRows] = await pool.execute(
        `SELECT 
          sp.*,
          d.name as driver_name,
          d.phone as driver_phone,
          bs.stop_name as stop_name,
          r.route_name
        FROM student_pickup sp
        LEFT JOIN driver d ON sp.driver_id = d.driver_id
        LEFT JOIN bus_stop bs ON sp.stop_id = bs.stop_id
        LEFT JOIN bus_schedule bsched ON sp.schedule_id = bsched.schedule_id
        LEFT JOIN route r ON bsched.route_id = r.route_id
        WHERE sp.student_id = ?
        ORDER BY sp.pickup_time DESC
        LIMIT 5`,
        [studentId]
      );

      return {
        ...student,
        pickupHistory: pickupRows
      };
    } catch (error) {
      console.error('Error in getStudentWithPickupSchedule:', error);
      throw error;
    }
  },

  /**
   * Kiểm tra học sinh đã tồn tại chưa
   * @param {string} studentId - ID học sinh
   * @returns {Promise<boolean>} true nếu đã tồn tại
   */
  isStudentExists: async (studentId) => {
    try {
      const [rows] = await pool.execute(
        'SELECT COUNT(*) as count FROM student WHERE student_id = ?',
        [studentId]
      );
      return rows[0].count > 0;
    } catch (error) {
      console.error('Error in isStudentExists:', error);
      throw error;
    }
  }
};

module.exports = studentRepository;