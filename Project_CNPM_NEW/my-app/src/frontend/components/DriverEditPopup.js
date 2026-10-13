import React, { useState, useEffect } from "react"; 
import "../QuanLyTaiXe.css"; // Dùng chung CSS
import WorkScheduleCheckboxes from "./WorkScheduleCheckboxes";

export default function DriverEditPopup({ isOpen, onClose, drivers, onUpdateDriver, onDeleteDriver }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [driverFound, setDriverFound] = useState(false);
  const [formData, setFormData] = useState(null); 

  useEffect(() => {
    setSearchTerm("");
    setSearchResults([]);
    setShowDropdown(false);
    setDriverFound(false);
    setFormData(null);
  }, [isOpen]);

  const handleSearchChange = (e) => {
    const term = e.target.value;
    setSearchTerm(term);
    setDriverFound(false);
    setFormData(null);
    if (term.trim() === "") {
      setSearchResults([]);
      setShowDropdown(false);
      return;
    }
    const filteredDrivers = drivers.filter(driver => 
      driver.id.toLowerCase().includes(term.toLowerCase()) ||
      driver.name.toLowerCase().includes(term.toLowerCase())
    );
    setSearchResults(filteredDrivers);
    setShowDropdown(filteredDrivers.length > 0);
  };

  const handleResultClick = (driver) => {
    setSearchTerm(driver.id); 
    setFormData({ ...driver }); 
    setDriverFound(true);       
    setSearchResults([]);       
    setShowDropdown(false);     
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!driverFound) return;

    try {
      const response = await fetch(`http://localhost:3001/api/drivers/${formData.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData) 
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Lỗi khi cập nhật tài xế');
      }
      
      const updatedDriverData = await response.json();
      onUpdateDriver(updatedDriverData);
      alert("Cập nhật thông tin thành công!");
      onClose();

    } catch (err) {
      console.error("Lỗi handleSubmit (Chỉnh sửa):", err);
      alert(`Đã xảy ra lỗi: ${err.message}`);
    }
  };

  const handleDelete = async () => {
    if (!driverFound) return;
    if (window.confirm(`Bạn có chắc chắn muốn xóa tài xế ${formData.name} (Mã: ${formData.id}) không?`)) {
      try {
        const response = await fetch(`http://localhost:3001/api/drivers/${formData.id}`, {
          method: 'DELETE',
        });
        if (!response.ok) {
          const errData = await response.json();
          throw new Error(errData.error || 'Lỗi khi xóa tài xế');
        }
        onDeleteDriver(formData.id);
        alert(`Đã xóa tài xế: ${formData.id}`);
        onClose();
      } catch (err) {
        console.error("Lỗi handleDelete:", err);
        alert(`Đã xảy ra lỗi: ${err.message}`);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="popup-overlay">
      <div className="popup driver-form-popup" style={{ width: '600px' }}>
        <div className="popup-header">
          <h2>Chỉnh sửa thông tin tài xế</h2>
          <button className="close-btn" onClick={onClose}>✖</button>
        </div>

        <form onSubmit={handleSubmit} className="driver-form-content">
          <div className="search-to-edit-group">
            <label htmlFor="search-id">Tìm tài xế (theo Mã hoặc Tên)</label>
            <div className="search-bar"> 
              <input type="text" id="search-id" value={searchTerm} onChange={handleSearchChange} placeholder="Nhập mã hoặc tên tài xế..." autoComplete="off" onBlur={() => { setTimeout(() => setShowDropdown(false), 200); }} onFocus={handleSearchChange} />
              {showDropdown && searchResults.length > 0 && (
                <ul className="search-results-dropdown">
                  {searchResults.map(driver => (
                    <li key={driver.id} className="search-result-item" onMouseDown={() => handleResultClick(driver)}>
                      <svg className="search-result-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/></svg>
                      <span>{driver.id} - {driver.name}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
          <hr className="form-divider" />
          <div className="form-grid">
            <div className="form-group"><label htmlFor="edit-name">Họ tên</label><input type="text" id="edit-name" name="name" value={formData?.name || ''} onChange={handleChange} disabled={!driverFound} required /></div>
            <div className="form-group"><label htmlFor="edit-phone">Số điện thoại</label><input type="tel" id="edit-phone" name="phone" value={formData?.phone || ''} onChange={handleChange} disabled={!driverFound} /></div>
            <div className="form-group full-width"><label htmlFor="edit-address">Địa chỉ</label><input type="text" id="edit-address" name="address" value={formData?.address || ''} onChange={handleChange} disabled={!driverFound} /></div>
            <div className="form-group"><label htmlFor="edit-status">Trạng thái</label><select id="edit-status" name="status" value={formData?.status || 'Rảnh'} onChange={handleChange} disabled={!driverFound}><option value="Đang hoạt động">Đang hoạt động</option><option value="Rảnh">Rảnh</option><option value="Nghỉ phép">Nghỉ phép</option></select></div>
            <div className="form-group"><label htmlFor="edit-route">Tuyến đường phụ trách</label><input type="text" id="edit-route" name="route" value={formData?.route || ''} onChange={handleChange} disabled={!driverFound} /></div>
            <div className="form-group full-width"><label htmlFor="edit-license">Hạng bằng lái</label><select id="edit-license" name="licenseClass" value={formData?.licenseClass || 'B2'} onChange={handleChange} disabled={!driverFound}><option value="B1">B1 (Xe số tự động)</option><option value="B2">B2 (Xe số sàn)</option><option value="C">C (Xe tải)</option><option value="D">D (Xe khách 10-30 chỗ)</option><option value="E">E (Xe khách trên 30 chỗ)</option></select></div>
            <div className="form-group full-width">
              <label>Lịch làm việc cố định</label>
              <WorkScheduleCheckboxes
                selectedDays={formData?.work_schedule || ''}
                onChange={(scheduleString) => {
                  setFormData(prev => ({...prev, work_schedule: scheduleString}));
                }}
                disabled={!driverFound}
              />
            </div>
          </div>
          <div className="popup-footer space-between">
            <button type="button" className="btn-delete" onClick={handleDelete} disabled={!driverFound}>Xóa tài xế</button>
            <div className="footer-right-buttons">
              <button type="button" className="btn-cancel" onClick={onClose}>Hủy</button>
              <button type="submit" className="btn-save" disabled={!driverFound}>Lưu lại</button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}