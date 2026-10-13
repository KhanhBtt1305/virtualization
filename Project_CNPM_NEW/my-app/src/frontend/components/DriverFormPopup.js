// File: src/frontend/components/DriverFormPopup.js
import React, { useState, useEffect } from "react"; 
import "../QuanLyTaiXe.css"; // Dùng chung CSS
import WorkScheduleCheckboxes from "./WorkScheduleCheckboxes";

export default function DriverFormPopup({ isOpen, onClose, onAddDriver }) {

  const title = "Thêm tài xế mới";
  const [formData, setFormData] = useState({
    id: "", name: "", phone: "", address: "", 
    status: "Rảnh", route: "", licenseClass: "B2",
    work_schedule: "" 
  });

  useEffect(() => {
    if (isOpen) {
      setFormData({
        id: "", name: "", phone: "", address: "", 
        status: "Rảnh", route: "", licenseClass: "B2",
        work_schedule: ""
      });
    }
  }, [isOpen]); 


  if (!isOpen) {
    return null;
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value, }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    let finalData = { ...formData };
    if (!finalData.id) {
        finalData.id = `TX${Math.floor(100 + Math.random() * 900)}`;
        alert(`Đã tạm thời gán Mã tài xế là: ${finalData.id}. Bạn nên cho phép nhập Mã tài xế.`);
    }

    try {
      const response = await fetch('http://localhost:3001/api/drivers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(finalData) 
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Lỗi khi thêm tài xế');
      }

      const newDriver = await response.json();
      onAddDriver(newDriver);
      alert("Thêm tài xế mới thành công!");
      onClose(); 

    } catch (err) {
      console.error("Lỗi handleSubmit (Thêm mới):", err);
      alert(`Đã xảy ra lỗi: ${err.message}`);
    }
  };

  return (
    <div className="popup-overlay">
      <div className="popup driver-form-popup">
        <div className="popup-header">
          <h2>{title}</h2> 
          <button className="close-btn" onClick={onClose}>✖</button>
        </div>

        <form onSubmit={handleSubmit} className="driver-form-content">
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="add-id">Mã tài xế</label>
              <input type="text" id="add-id" name="id" value={formData.id} onChange={handleChange} placeholder="Ví dụ: TX005" required />
            </div>
            <div className="form-group">
              <label htmlFor="add-name">Họ tên</label>
              <input type="text" id="add-name" name="name" value={formData.name} onChange={handleChange} required />
            </div>
             <div className="form-group">
              <label htmlFor="add-phone">Số điện thoại</label>
              <input type="tel" id="add-phone" name="phone" value={formData.phone} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label htmlFor="add-address">Địa chỉ</label>
              <input type="text" id="add-address" name="address" value={formData.address} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label htmlFor="add-status">Trạng thái</label>
              <select id="add-status" name="status" value={formData.status} onChange={handleChange}>
                <option value="Đang hoạt động">Đang hoạt động</option>
                <option value="Rảnh">Rảnh</option>
                <option value="Nghỉ phép">Nghỉ phép</option>
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="add-route">Tuyến đường phụ trách</label>
              <input type="text" id="add-route" name="route" value={formData.route} onChange={handleChange} />
            </div>
            <div className="form-group full-width">
              <label htmlFor="add-license">Hạng bằng lái</label>
              <select id="add-license" name="licenseClass" value={formData.licenseClass} onChange={handleChange}>
                <option value="B1">B1 (Xe số tự động)</option>
                <option value="B2">B2 (Xe số sàn)</option>
                <option value="C">C (Xe tải)</option>
                <option value="D">D (Xe khách 10-30 chỗ)</option>
                <option value="E">E (Xe khách trên 30 chỗ)</option>
              </select>
            </div>
            
            <div className="form-group full-width">
              <label>Lịch làm việc cố định</label>
              <WorkScheduleCheckboxes
                selectedDays={formData.work_schedule}
                onChange={(scheduleString) => {
                  setFormData(prev => ({...prev, work_schedule: scheduleString}));
                }}
              />
            </div>
            
          </div>
          
          <div className="popup-footer">
            <button type="button" className="btn-cancel" onClick={onClose}>Hủy</button>
            <button type="submit" className="btn-save">Lưu lại</button>
          </div>
        </form>
      </div>
    </div>
  );
}