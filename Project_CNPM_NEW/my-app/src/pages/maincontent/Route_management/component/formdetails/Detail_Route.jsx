import React, { useState } from "react";
import './detail_route.css';
/*
  React component: RouteDetail
  - props:
      route: Route instance or plain object with route fields
      onSave(updatedRouteObject) => callback when save pressed
      onClose() => close/detail back callback
*/

export function RouteDetail({ route = {}, onSave = () => {}, onClose = () => {} }) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState(route);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    // basic validation could be added here
    setEditing(false);
    onSave({ ...form });
  };

  const handleCancel = () => {
    // reset form to original route values and exit edit mode
    setEditing(false);
  };

  return (
    // overlay wrapper (covers entire screen)
    <div className="route-detail-overlay" role="dialog" aria-modal="true">
      {/* centered modal */}
      <div className="route-detail-card">
        <div className="header">
          <h3 style={{ margin: 0 }}>{form.route_name || "Chi tiết tuyến"}</h3>
          <div className="action-group">
            <button onClick={onClose} className="btn btn-secondary">Đóng</button>
            {!editing ? (
              <button onClick={() => setEditing(true)} className="btn btn-primary">Sửa</button>
            ) : (
              <>
                <button onClick={handleSave} className="btn btn-primary">Lưu</button>
                <button onClick={handleCancel} className="btn btn-secondary">Hủy</button>
              </>
            )}
          </div>
        </div>

        <div className="form-grid">
          <div>
            <label className="label">Mã tuyến</label>
            <input name="route_code" value={form.route_code} onChange={handleChange} disabled={!editing} className="input" />
          </div>

          <div>
            <label className="label">Số học sinh</label>
            <input name="total_students" value={form.total_students} onChange={handleChange} disabled={!editing} className="input" />
          </div>

          <div>
            <label className="label">Điểm bắt đầu</label>
            <input name="start_location" value={form.start_location} onChange={handleChange} disabled={!editing} className="input" />
          </div>

          <div>
            <label className="label">Điểm kết thúc</label>
            <input name="end_location" value={form.end_location} onChange={handleChange} disabled={!editing} className="input" />
          </div>

          <div>
            <label className="label">Thời gian bắt đầu</label>
            <input name="planned_start" value={form.planned_start} onChange={handleChange} disabled={!editing} className="input" />
          </div>

          <div>
            <label className="label">Thời gian kết thúc</label>
            <input name="planned_end" value={form.planned_end} onChange={handleChange} disabled={!editing} className="input" />
          </div>

          <div>
            <label className="label">Khoảng cách (km)</label>
            <input name="distance_km" value={form.distance_km} onChange={handleChange} disabled={!editing} className="input" />
          </div>

          <div>
            <label className="label">Ước tính thời lượng (phút)</label>
            <input name="estimated_duration_minutes" value={form.estimated_duration_minutes} onChange={handleChange} disabled={!editing} className="input" />
          </div>

          <div className="full-row">
            <label className="label">Trạng thái</label>
            <select name="status" value={form.status} onChange={handleChange} disabled={!editing} className="input">
              <option value="active">Hoạt động</option>
              <option value="inactive">Không hoạt động</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}