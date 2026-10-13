import React, { useState } from 'react';
import './style.css';
import { Student } from './../../../../../models/Student';

function formatDate(d) {
  if (!d) return 'N/A';
  const date = d instanceof Date ? d : new Date(d);
  if (isNaN(date.getTime())) return 'N/A';
  return date.toLocaleDateString();
}

function Detail_Student({ tempStudent = new Student(), backToList = () => {} }) {
  // Ensure we work with plain Student instance
  const [editing, setEditing] = useState(false);
  const [student, setStudent] = useState(tempStudent);

  const handleBack = () => backToList();

  const handleEditToggle = () => setEditing(v => !v);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setStudent(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    setEditing(false);
    // If you need to persist, call API or lift state up (not implemented here)
    console.log('Saved student (local only):', student);
  };

  return (
    <div className="container-detail-student">
      <div className="header-detail-student">
        <button className="btn-back-icon" onClick={handleBack}>← Quay lại</button>
        <h1>Chi tiết học sinh</h1>
        <div className="student-id">ID: {student.student_id ?? 'N/A'}</div>
      </div>

      <div className="content">
        {/* Personal Info */}
        <section className="info-card">
          <h2 className="card-title">Thông tin cá nhân</h2>
          <div className="info-grid">
            <div className="info-item">
              <span className="info-label">Họ và tên</span>
              {editing ? (
                <input name="full_name" className="info-input" value={student.full_name ?? ''} onChange={handleChange} />
              ) : (
                <span className="info-value">{student.full_name || 'N/A'}</span>
              )}
            </div>

            <div className="info-item">
              <span className="info-label">Mã học sinh</span>
              {editing ? (
                <input name="student_code" className="info-input" value={student.student_code ?? ''} onChange={handleChange} />
              ) : (
                <span className="info-value">{student.student_code || 'N/A'}</span>
              )}
            </div>

            <div className="info-item">
              <span className="info-label">Giới tính</span>
              {editing ? (
                <select name="gender" value={student.gender ?? ''} onChange={handleChange} className="info-input">
                  <option value="">Chọn</option>
                  <option value="male">Nam</option>
                  <option value="female">Nữ</option>
                  <option value="other">Khác</option>
                </select>
              ) : (
                <span className="info-value">{student.gender || 'N/A'}</span>
              )}
            </div>

            <div className="info-item">
              <span className="info-label">Ngày sinh</span>
              {editing ? (
                <input name="date_of_birth" type="date" className="info-input"
                  value={student.date_of_birth ? (new Date(student.date_of_birth)).toISOString().slice(0,10) : ''}
                  onChange={handleChange}
                />
              ) : (
                <span className="info-value">{formatDate(student.date_of_birth)}</span>
              )}
            </div>
          </div>
        </section>

        {/* Contact Info */}
        <section className="info-card">
          <h2 className="card-title">Thông tin liên hệ</h2>
          <div className="info-grid">
            <div className="info-item full-width">
              <span className="info-label">Địa chỉ</span>
              {editing ? (
                <input name="home_address" className="info-input" value={student.home_address ?? ''} onChange={handleChange} />
              ) : (
                <span className="info-value">{student.home_address || 'N/A'}</span>
              )}
            </div>

            <div className="info-item">
              <span className="info-label">Số điện thoại</span>
              {editing ? (
                <input name="phone" className="info-input" value={student.phone ?? ''} onChange={handleChange} />
              ) : (
                <span className="info-value">{student.phone || 'N/A'}</span>
              )}
            </div>

            <div className="info-item">
              <span className="info-label">Email</span>
              {editing ? (
                <input name="email" className="info-input" value={student.email ?? ''} onChange={handleChange} />
              ) : (
                <span className="info-value" style={{ wordBreak: 'break-word' }}>{student.email || 'N/A'}</span>
              )}
            </div>
          </div>
        </section>

        {/* Academic Info */}
        <section className="info-card">
          <h2 className="card-title">Thông tin học tập</h2>
          <div className="info-grid">
            <div className="info-item">
              <span className="info-label">Lớp</span>
              {editing ? (
                <input name="class_name" className="info-input" value={student.class_name ?? ''} onChange={handleChange} />
              ) : (
                <span className="info-value">{student.class_name || 'N/A'}</span>
              )}
            </div>

            <div className="info-item">
              <span className="info-label">Trường</span>
              {editing ? (
                <input name="school_name" className="info-input" value={student.school_name ?? ''} onChange={handleChange} />
              ) : (
                <span className="info-value">{student.school_name || 'N/A'}</span>
              )}
            </div>

            <div className="info-item">
              <span className="info-label">Tuyến</span>
              <span className="info-value">{student.route ?? student.route_id ?? 'N/A'}</span>
            </div>

            <div className="info-item">
              <span className="info-label">Giờ đón</span>
              <span className="info-value">{student.pickupTime ?? 'N/A'}</span>
            </div>
          </div>
        </section>

        {/* Parent Info */}
        <section className="info-card">
          <h2 className="card-title">Thông tin phụ huynh</h2>
          <div className="info-grid">
            <div className="info-item">
              <span className="info-label">Họ tên</span>
              {editing ? (
                <input name="parent_name" className="info-input" value={student.parent_name ?? ''} onChange={handleChange} />
              ) : (
                <span className="info-value">{student.parent_name || 'N/A'}</span>
              )}
            </div>

            <div className="info-item">
              <span className="info-label">Số điện thoại</span>
              {editing ? (
                <input name="parent_phone" className="info-input" value={student.parent_phone ?? ''} onChange={handleChange} />
              ) : (
                <span className="info-value">{student.parent_phone || 'N/A'}</span>
              )}
            </div>

            <div className="info-item">
              <span className="info-label">Email</span>
              {editing ? (
                <input name="parent_email" className="info-input" value={student.parent_email ?? ''} onChange={handleChange} />
              ) : (
                <span className="info-value" style={{ wordBreak: 'break-word' }}>{student.parent_email || 'N/A'}</span>
              )}
            </div>
          </div>
        </section>
      </div>

      <div className="btn-group">
        <button className="btn btn-secondary" onClick={handleBack}>Quay lại</button>

        {!editing ? (
          <button className="btn btn-primary" onClick={handleEditToggle}>Chỉnh sửa</button>
        ) : (
          <>
            <button className="btn btn-primary" onClick={handleSave}>Lưu</button>
            <button className="btn btn-secondary" onClick={() => { setStudent(tempStudent); setEditing(false); }}>Hủy</button>
          </>
        )}
      </div>
    </div>
  );
}

export default Detail_Student;