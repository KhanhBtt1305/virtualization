import React from "react";
import "../QuanLyXeBuyt.css"; 

function BusFormPopup({
  show, // Prop để ẩn/hiện
  formType,
  formData,
  allRoutes,
  errorMessage,
  suggestions,
  
  // Các hàm xử lý (handlers)
  onClose,
  onSubmit,
  onDelete,
  onIdChange,
  onSuggestionClick,
  setFormData // Cần prop này để cập nhật form
}) {
  if (!show) {
    return null;
  }

  return (
    <div className="bus-popup-overlay">
      <div className="bus-popup-content">
        <h3>
          {formType === "add"
            ? "Thêm xe buýt"
            : formType === "edit"
            ? "Chỉnh sửa xe buýt"
            : "Thông tin xe buýt"}
        </h3>

        <form onSubmit={onSubmit}>
          <label>Mã số xe</label>
          <div className="search-container">
            <input
              type="text"
              value={formData.id}
              readOnly={formType === 'add' || formType === 'view'}
              className={(formType === 'add' || formType === 'view') ? 'readonly-input' : ''}
              onChange={(e) => onIdChange(e.target.value)}
              autoComplete="off"
              required
            />
            
            {formType === 'edit' && suggestions.length > 0 && (
              <ul className="suggestions-dropdown">
                {suggestions.map(bus => (
                  <li 
                    key={bus.id} 
                    onClick={() => onSuggestionClick(bus)}
                    className="suggestion-item"
                  >
                    {bus.id} ({bus.license})
                  </li>
                ))}
              </ul>
            )}
          </div>
          {errorMessage && <p className="error">{errorMessage}</p>}

          <label>Biển số xe</label>
          <input
            type="text"
            value={formData.license}
            readOnly={formType === "view"}
            onChange={(e) => setFormData({ ...formData, license: e.target.value })}
            required 
          />

          <label>Tuyến đường</label>
          <select
            value={formData.route} 
            disabled={formType === "view"} 
            onChange={(e) => setFormData({ ...formData, route: e.target.value })}
            required
          >
            <option value="">-- Chọn tuyến đường --</option>
            {allRoutes.map((route) => (
              <option key={route.route_id} value={route.route_name}>
                {route.route_name} ({route.start_point} {"->"} {route.end_point})
              </option>
            ))}
          </select>

          <label>Tình trạng xe</label>
          <select
            value={formData.status}
            disabled={formType === "view"}
            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
            required 
          >
            <option value="">-- Chọn --</option>
            <option value="Đang hoạt động">Đang hoạt động</option>
            <option value="Ngưng hoạt động">Ngưng hoạt động</option>
            <option value="Đang bảo trì">Đang bảo trì</option>
          </select>

          <label>Tình trạng xuất phát</label>
          <select
            value={formData.departure}
            disabled={formType === "view"}
            onChange={(e) => setFormData({ ...formData, departure: e.target.value })}
            required 
          >
            <option value="">-- Chọn --</option>
            <option value="Đã xuất phát">Đã xuất phát</option>
            <option value="Đã kết thúc">Đã kết thúc</option>
            <option value="Chưa xuất phát">Chưa xuất phát</option>
          </select>

          <label>Hạn đăng kiểm</label>
          <input
            type="date"
            value={formData.registry}
            readOnly={formType === "view"}
            onChange={(e) => setFormData({ ...formData, registry: e.target.value })}
            required 
          />

          <div className="popup-buttons">
            {formType !== "view" && <button type="submit">Lưu</button>}
            <button type="button" onClick={onClose}>Thoát</button>
            {formType !== "add" && (
              <button type="button" className="delete-btn" onClick={onDelete}>Xóa</button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}

export default BusFormPopup;