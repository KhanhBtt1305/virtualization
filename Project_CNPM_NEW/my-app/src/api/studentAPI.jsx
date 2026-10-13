// src/api/student.api.js
import axiosClient from "./AxiosClient";
const studentAPI = {
  renListData: (res)=>res.data.data,
  // Lấy tất cả học sinh
  getAllStudents: () => axiosClient.get("/students"),

  // Tìm kiếm học sinh
  searchStudents: (keyword) =>
    axiosClient.get(`/students/search`, {
      params: { q: keyword }
    }),

  // Lấy thống kê học sinh
  getStatistics: () => axiosClient.get("/students/statistics"),

  // Lấy học sinh theo ID
  getStudentById: (id) => axiosClient.get(`/students/${id}`),

  // Lấy học sinh với lịch đón
  getStudentWithSchedule: (id) =>
    axiosClient.get(`/students/${id}/with-schedule`),

  // Lấy học sinh theo phụ huynh
  getStudentsByParent: (parentId) =>
    axiosClient.get(`/students/parent/${parentId}`),

  // Lấy học sinh theo điểm đón
  getStudentsByPickupStop: (stopId) =>
    axiosClient.get(`/students/stop/pickup/${stopId}`),

  // Lấy học sinh theo trường
  getStudentsBySchool: (schoolName) =>
    axiosClient.get(`/students/school/${schoolName}`),

  // Tạo học sinh mới
  createStudent: (data) => axiosClient.post("/students", data),

  // Cập nhật học sinh
  updateStudent: (id, data) => axiosClient.put(`/students/${id}`, data),

  // Xóa học sinh
  deleteStudent: (id) => axiosClient.delete(`/students/${id}`)
};

export default studentAPI;
