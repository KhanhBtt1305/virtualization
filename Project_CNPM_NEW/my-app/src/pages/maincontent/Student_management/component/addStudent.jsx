import React, { useState } from 'react';
import './addStudent.css';
import { Student } from './../../../../models/Student';

function AddStudent({ onSave = () => {}, onClose = () => {} }) {
  const [form, setForm] = useState({
    student_code: '',
    full_name: '',
    class_name: '',
    school_name: '',
    phone: '',
    email: '',
    date_of_birth: '',
    gender: 'other',
    parent_name: '',
    parent_phone: '',
    parent_email: '',
    home_address: '',
    pickup_stop_id: '',
    dropoff_stop_id: '',
    route_id: '',
    enrollment_date: '',
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    // clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!form.student_code.trim()) newErrors.student_code = 'Mã học sinh là bắt buộc';
    if (!form.full_name.trim()) newErrors.full_name = 'Họ tên là bắt buộc';
    if (!form.class_name.trim()) newErrors.class_name = 'Lớp là bắt buộc';
    if (!form.parent_name.trim()) newErrors.parent_name = 'Tên phụ huynh là bắt buộc';
    if (!form.parent_phone.trim()) newErrors.parent_phone = 'Số điện thoại phụ huynh là bắt buộc';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    // Create new Student instance
    const newStudent = new Student({
      ...form,
      is_active: true,
      enrollment_date: form.enrollment_date || new Date().toISOString().split('T')[0],
      created_at: new Date(),
      updated_at: new Date(),
    });

    console.log('New student:', newStudent);
    onSave(newStudent);
    onClose();
  };

  const handleCancel = () => {
    setForm({
      student_code: '',
      full_name: '',
      class_name: '',
      school_name: '',
      phone: '',
      email: '',
      date_of_birth: '',
      gender: 'other',
      parent_name: '',
      parent_phone: '',
      parent_email: '',
      home_address: '',
      pickup_stop_id: '',
      dropoff_stop_id: '',
      route_id: '',
      enrollment_date: '',
    });
    setErrors({});
    onClose();
  };

  return (
    <div className="add-student-overlay">
      <div className="add-student-modal">
        <div className="modal-header">
          <h2>Thêm học sinh mới</h2>
          <button className="btn-close" onClick={()=>onClose(false)}>✕</button>
        </div>

        <form onSubmit={handleSave} className="add-student-form">
          <div className="form-section">
            <h3>Thông tin cá nhân</h3>
            <div className="form-grid">
              <div className="form-group">
                <label>Mã học sinh *</label>
                <input
                  type="text"
                  name="student_code"
                  value={form.student_code}
                  onChange={handleChange}
                  placeholder="VD: S001"
                  className={errors.student_code ? 'input-error' : ''}
                />
                {errors.student_code && <span className="error-text">{errors.student_code}</span>}
              </div>

              <div className="form-group">
                <label>Họ và tên *</label>
                <input
                  type="text"
                  name="full_name"
                  value={form.full_name}
                  onChange={handleChange}
                  placeholder="VD: Nguyễn Văn A"
                  className={errors.full_name ? 'input-error' : ''}
                />
                {errors.full_name && <span className="error-text">{errors.full_name}</span>}
              </div>

              <div className="form-group">
                <label>Giới tính</label>
                <select name="gender" value={form.gender} onChange={handleChange}>
                  <option value="male">Nam</option>
                  <option value="female">Nữ</option>
                  <option value="other">Khác</option>
                </select>
              </div>

              <div className="form-group">
                <label>Ngày sinh</label>
                <input
                  type="date"
                  name="date_of_birth"
                  value={form.date_of_birth}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>

          <div className="form-section">
            <h3>Thông tin học tập</h3>
            <div className="form-grid">
              <div className="form-group">
                <label>Lớp *</label>
                <input
                  type="text"
                  name="class_name"
                  value={form.class_name}
                  onChange={handleChange}
                  placeholder="VD: 10A1"
                  className={errors.class_name ? 'input-error' : ''}
                />
                {errors.class_name && <span className="error-text">{errors.class_name}</span>}
              </div>

              <div className="form-group">
                <label>Trường</label>
                <input
                  type="text"
                  name="school_name"
                  value={form.school_name}
                  onChange={handleChange}
                  placeholder="VD: THPT Nguyễn Huệ"
                />
              </div>

              <div className="form-group">
                <label>Tuyến xe</label>
                <input
                  type="text"
                  name="route_id"
                  value={form.route_id}
                  onChange={handleChange}
                  placeholder="VD: Tuyến 1"
                />
              </div>

              <div className="form-group">
                <label>Ngày ghi danh</label>
                <input
                  type="date"
                  name="enrollment_date"
                  value={form.enrollment_date}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>

          <div className="form-section">
            <h3>Thông tin liên hệ</h3>
            <div className="form-grid">
              <div className="form-group full-width">
                <label>Địa chỉ</label>
                <input
                  type="text"
                  name="home_address"
                  value={form.home_address}
                  onChange={handleChange}
                  placeholder="VD: 123 Đường A, Quận 1, TP.HCM"
                />
              </div>

              <div className="form-group">
                <label>Số điện thoại</label>
                <input
                  type="tel"
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  placeholder="VD: 0912345678"
                />
              </div>

              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="VD: student@email.com"
                />
              </div>
            </div>
          </div>

          <div className="form-section">
            <h3>Thông tin phụ huynh</h3>
            <div className="form-grid">
              <div className="form-group">
                <label>Tên phụ huynh *</label>
                <input
                  type="text"
                  name="parent_name"
                  value={form.parent_name}
                  onChange={handleChange}
                  placeholder="VD: Nguyễn Văn X"
                  className={errors.parent_name ? 'input-error' : ''}
                />
                {errors.parent_name && <span className="error-text">{errors.parent_name}</span>}
              </div>

              <div className="form-group">
                <label>Số điện thoại phụ huynh *</label>
                <input
                  type="tel"
                  name="parent_phone"
                  value={form.parent_phone}
                  onChange={handleChange}
                  placeholder="VD: 0987654321"
                  className={errors.parent_phone ? 'input-error' : ''}
                />
                {errors.parent_phone && <span className="error-text">{errors.parent_phone}</span>}
              </div>

              <div className="form-group full-width">
                <label>Email phụ huynh</label>
                <input
                  type="email"
                  name="parent_email"
                  value={form.parent_email}
                  onChange={handleChange}
                  placeholder="VD: parent@email.com"
                />
              </div>
            </div>
          </div>

          <div className="form-section">
            <h3>Thông tin trạm</h3>
            <div className="form-grid">
              <div className="form-group">
                <label>Trạm đón</label>
                <input
                  type="text"
                  name="pickup_stop_id"
                  value={form.pickup_stop_id}
                  onChange={handleChange}
                  placeholder="VD: 1"
                />
              </div>

              <div className="form-group">
                <label>Trạm trả</label>
                <input
                  type="text"
                  name="dropoff_stop_id"
                  value={form.dropoff_stop_id}
                  onChange={handleChange}
                  placeholder="VD: 5"
                />
              </div>
            </div>
          </div>

          <div className="form-actions">
            <button type="submit" className="btn btn-primary">Thêm học sinh</button>
            <button type="button" className="btn btn-secondary" onClick={handleCancel}>Hủy</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddStudent;