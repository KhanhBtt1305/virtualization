import React, { useState, useEffect } from 'react';

const Profile = ({ userInfo, setUserInfo, isEditing, setIsEditing }) => {
  const [students, setStudents] = useState([]);
  const [newStudent, setNewStudent] = useState({ name: '', class: '' });
  const [showStudentForm, setShowStudentForm] = useState(false);

 // eslint-disable-next-line react-hooks/exhaustive-deps
useEffect(() => {
  if (userInfo && userInfo.parent_id) {
      fetch('http://localhost:8081/api/students')
      .then(res => res.json())
      .then(data => {
          const myStudents = data.filter(s => s.parent_id === userInfo.parent_id);
          setStudents(myStudents);
      })
      .catch(err => console.error(err));
  }
}, [userInfo]);  // Giữ nguyên deps

  // XỬ LÝ LƯU PROFILE (UPDATE)
  function handleSaveProfile() {
    fetch('http://localhost:8081/api/profile', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userInfo)
    })
      .then(res => res.json())
      .then(data => {
        if (data.message === "Cập nhật thành công") {
          alert("Cập nhật thông tin thành công!");
          setIsEditing(false);
        } else {
          alert("Lỗi: " + JSON.stringify(data));
        }
      })
      .catch(err => alert("Lỗi kết nối: " + err));
  }

  // XỬ LÝ THÊM HỌC SINH
  const handleAddStudent = () => {
    if (newStudent.name && newStudent.class) {
      fetch('http://localhost:8081/api/students', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            name: newStudent.name,
            studentClass: newStudent.class,
            parent_id: userInfo.parent_id // Gắn đúng ID phụ huynh
        })
      })
      .then(res => res.json())
      .then(data => {
        const addedStudent = { 
            student_id: data.student_id, 
            name: newStudent.name, 
            class: newStudent.class,
            parent_id: userInfo.parent_id 
        };
        // Cập nhật danh sách ngay lập tức
        setStudents([...students, addedStudent]);
        setNewStudent({ name: '', class: '' });
        setShowStudentForm(false);
      })
      .catch(err => alert('Lỗi: ' + err));
    } else {
        alert("Vui lòng nhập đủ Tên và Lớp!");
    }
  };

  // XỬ LÝ XÓA HỌC SINH
  const handleDeleteStudent = (id) => {
    if(window.confirm("Bạn muốn xóa học sinh này?")) {
        fetch(`http://localhost:8081/api/students/${id}`, {
            method: 'DELETE'
        })
        .then(() => {
            setStudents(students.filter(s => s.student_id !== id));
        });
    }
  };

  const styles = {
    contentSection: { maxWidth: '800px', margin: '0 auto' },
    sectionTitle: { color: '#333', marginBottom: '20px', fontSize: '24px', margin: 0 },
    infoCard: { background: '#f8f9fa', borderRadius: '10px', padding: '20px', marginBottom: '20px', borderLeft: '4px solid #667eea' },
    infoRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px', paddingBottom: '10px', borderBottom: '1px solid #e9ecef' },
    infoLabel: { color: '#495057', fontWeight: '600', minWidth: '120px', margin: 0 },
    infoValue: { color: '#6c757d', margin: 0 },
    inputField: { border: '1px solid #ced4da', borderRadius: '5px', padding: '8px 12px', fontSize: '14px', width: '100%', boxSizing: 'border-box' },
    selectField: { border: '1px solid #ced4da', borderRadius: '5px', padding: '8px 12px', fontSize: '14px', width: '100%', boxSizing: 'border-box', backgroundColor: 'white' },
    buttonGroup: { display: 'flex', gap: '10px', marginTop: '20px' },
    button: { padding: '10px 20px', border: 'none', borderRadius: '5px', cursor: 'pointer', fontSize: '14px', fontWeight: '500', transition: 'all 0.3s ease' },
    primaryButton: { background: '#667eea', color: 'white' },
    secondaryButton: { background: '#6c757d', color: 'white' },
    editButton: { background: '#28a745', color: 'white', padding: '8px 16px' },
    dangerButton: { background: '#dc3545', color: 'white', padding: '6px 12px', fontSize: '12px' },
    studentSection: { marginTop: '30px' },
    studentHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' },
    studentCard: { background: 'white', border: '1px solid #e9ecef', borderRadius: '8px', padding: '15px', marginBottom: '10px' },
    studentInfo: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
    studentName: { fontWeight: 'bold', color: '#333', margin: '0 0 5px 0' },
    studentClass: { color: '#6c757d', margin: 0, fontSize: '14px' },
    studentForm: { background: '#f8f9fa', border: '1px solid #dee2e6', borderRadius: '8px', padding: '20px', marginBottom: '20px' },
    formGroup: { marginBottom: '15px' },
    formLabel: { display: 'block', marginBottom: '5px', fontWeight: '600', color: '#495057' },
    formActions: { display: 'flex', gap: '10px', justifyContent: 'flex-end' }
  };

  return (
    <div style={styles.contentSection}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 style={styles.sectionTitle}>Thông tin cá nhân</h2>
        {!isEditing && (
          <button style={{...styles.button, ...styles.editButton}} onClick={() => setIsEditing(true)}>
            Chỉnh sửa
          </button>
        )}
      </div>
      
      {/* FORM THÔNG TIN PHỤ HUYNH */}
      <div style={styles.infoCard}>
        <div style={styles.infoRow}>
          <strong style={styles.infoLabel}>Họ và tên</strong>
          {isEditing ? <input style={styles.inputField} value={userInfo.name || ''} onChange={(e) => setUserInfo({...userInfo, name: e.target.value})} /> : <p style={styles.infoValue}>{userInfo.name}</p>}
        </div>
        
        <div style={styles.infoRow}>
          <strong style={styles.infoLabel}>Tuổi</strong>
          {isEditing ? <input type="number" style={styles.inputField} value={userInfo.age || ''} onChange={(e) => setUserInfo({...userInfo, age: e.target.value})} /> : <p style={styles.infoValue}>{userInfo.age}</p>}
        </div>

        <div style={styles.infoRow}>
          <strong style={styles.infoLabel}>Giới tính</strong>
          {isEditing ? (
            <select style={styles.selectField} value={userInfo.sex || ''} onChange={(e) => setUserInfo({...userInfo, sex: e.target.value})}>
              <option value="Nam">Nam</option>
              <option value="Nữ">Nữ</option>
              <option value="Khác">Khác</option>
            </select>
          ) : <p style={styles.infoValue}>{userInfo.sex}</p>}
        </div>
        
        <div style={styles.infoRow}>
          <strong style={styles.infoLabel}>Số điện thoại</strong>
          {isEditing ? <input style={styles.inputField} value={userInfo.phone || ''} onChange={(e) => setUserInfo({...userInfo, phone: e.target.value})} /> : <p style={styles.infoValue}>{userInfo.phone}</p>}
        </div>
        
        <div style={{...styles.infoRow, borderBottom: 'none'}}>
          <strong style={styles.infoLabel}>Email</strong>
          {isEditing ? <input style={styles.inputField} value={userInfo.email || ''} onChange={(e) => setUserInfo({...userInfo, email: e.target.value})} /> : <p style={styles.infoValue}>{userInfo.email}</p>}
        </div>

        {isEditing && (
          <div style={styles.buttonGroup}>
            <button style={{...styles.button, ...styles.primaryButton}} onClick={handleSaveProfile}>Lưu thay đổi</button>
            <button style={{...styles.button, ...styles.secondaryButton}} onClick={() => setIsEditing(false)}>Hủy</button>
          </div>
        )}
      </div>

      {/* FORM HỌC SINH */}
      <div style={styles.studentSection}>
        <div style={styles.studentHeader}>
          <h3 style={styles.sectionTitle}>Thông tin học sinh</h3>
          <button style={{...styles.button, ...styles.editButton}} onClick={() => setShowStudentForm(!showStudentForm)}>
            {showStudentForm ? 'Hủy thêm' : 'Thêm học sinh'}
          </button>
        </div>

        {showStudentForm && (
          <div style={styles.studentForm}>
            <h4 style={{margin: '0 0 15px 0', color: '#333'}}>Thêm học sinh mới</h4>
            <div style={styles.formGroup}>
              <label style={styles.formLabel}>Họ và tên</label>
              <input style={styles.inputField} value={newStudent.name} onChange={(e) => setNewStudent({...newStudent, name: e.target.value})} placeholder="Nhập họ tên" />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.formLabel}>Lớp</label>
              <input style={styles.inputField} value={newStudent.class} onChange={(e) => setNewStudent({...newStudent, class: e.target.value})} placeholder="Ví dụ: 10A1" />
            </div>
            <div style={styles.formActions}>
              <button style={{...styles.button, ...styles.primaryButton}} onClick={handleAddStudent}>Thêm</button>
            </div>
          </div>
        )}

        {students.length > 0 ? (
            students.map(student => (
                <div key={student.student_id} style={styles.studentCard}>
                <div style={styles.studentInfo}>
                    <div>
                    <h4 style={styles.studentName}>{student.name}</h4>
                    <p style={styles.studentClass}>Lớp: {student.class}</p>
                    </div>
                    <button style={{...styles.button, ...styles.dangerButton}} onClick={() => handleDeleteStudent(student.student_id)}>
                    Xóa
                    </button>
                </div>
                </div>
            ))
        ) : (
            <p style={{fontStyle: 'italic', color: '#999', textAlign: 'center'}}>Chưa có thông tin học sinh.</p>
        )}
      </div>
    </div>
  );
};

export default Profile;