import React, { useState, useEffect, useCallback } from "react";
import "./ThongBao.css";
import { apiUrl } from "../api/apiConfig";

const NOTIFICATION_API_URL = apiUrl("notifications");

export default function ThongBao() {
    const [activeTab, setActiveTab] = useState("all");
    const [showPopup, setShowPopup] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [filterStatus, setFilterStatus] = useState(""); 
    const [viewingNotice, setViewingNotice] = useState(null);
    
    const [usersList, setUsersList] = useState([]); 
    const [searchTerm, setSearchTerm] = useState(""); 
    const [selectAll, setSelectAll] = useState(true);
    
    const [newNotice, setNewNotice] = useState({
        recipient: "", title: "", content: "", type: "manual", scheduledTime: "", isRecurring: false, recurrenceDays: [], specificIds: []     
    });

    //  Format giờ chuẩn (Fix lỗi lệch múi giờ) ---
    const formatDateTime = (dateString) => {
        if (!dateString) return "";
        const date = new Date(dateString.endsWith("Z") ? dateString : dateString + "Z");

        const d = String(date.getDate()).padStart(2, "0");
        const m = String(date.getMonth() + 1).padStart(2, "0");
        const y = date.getFullYear();
        const h = String(date.getHours()).padStart(2, "0");
        const min = String(date.getMinutes()).padStart(2, "0");
        const s = String(date.getSeconds()).padStart(2, "0");

        return `${d}/${m}/${y} ${h}:${min}:${s}`;
    };
    // ---------------------------------------------------------

    const fetchNotifications = useCallback(async () => {
        try {
            const params = new URLSearchParams();
            if (activeTab !== 'all') params.append('type', activeTab);
            if (filterStatus) params.append('status', filterStatus);
            const res = await fetch(`${NOTIFICATION_API_URL}?${params.toString()}`);
            setNotifications(await res.json());
        } catch (e) { console.error(e); }
    }, [activeTab, filterStatus]);

    useEffect(() => { 
        fetchNotifications(); 
        const intervalId = setInterval(() => {
            fetchNotifications();
        }, 2000); // Tự cập nhật mỗi 2 giây
        return () => clearInterval(intervalId);
    }, [fetchNotifications]);

    useEffect(() => {
        if ((newNotice.recipient === 'driver' || newNotice.recipient === 'parent') && showPopup) {
            fetch(`${NOTIFICATION_API_URL}/users/${newNotice.recipient}`)
                .then(res => res.json())
                .then(data => {
                    setUsersList(data);
                    setSelectAll(true);
                    setNewNotice(prev => ({ ...prev, specificIds: [] }));
                    setSearchTerm("");
                })
                .catch(err => { console.error(err); setUsersList([]); });
        } else {
            setUsersList([]);
        }
    }, [newNotice.recipient, showPopup]);

    // --- LOGIC TÌM KIẾM & XỬ LÝ FORM (GIỮ NGUYÊN) ---
    const filteredUsers = usersList.filter(u => {
        const searchLower = searchTerm.toLowerCase();
        const nameMatch = u.name.toLowerCase().includes(searchLower);
        const idMatch = String(u.id).toLowerCase().includes(searchLower);
        return nameMatch || idMatch;
    });

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setNewNotice(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    };

    const handleDayCheck = (dayIndex) => {
        setNewNotice(prev => {
            const currentDays = prev.recurrenceDays;
            if (currentDays.includes(dayIndex)) return { ...prev, recurrenceDays: currentDays.filter(d => d !== dayIndex) };
            else return { ...prev, recurrenceDays: [...currentDays, dayIndex].sort() };
        });
    };

    const handleUserCheck = (id) => {
        setSelectAll(false);
        setNewNotice(prev => {
            const currentIds = prev.specificIds;
            if (selectAll) {
                const allIds = usersList.map(u => u.id);
                return { ...prev, specificIds: allIds.filter(uid => uid !== id) };
            }
            if (currentIds.includes(id)) return { ...prev, specificIds: currentIds.filter(x => x !== id) };
            else return { ...prev, specificIds: [...currentIds, id] };
        });
    };

    const handleSelectAll = (e) => {
        setSelectAll(e.target.checked);
        setNewNotice(prev => ({ ...prev, specificIds: [] })); 
    };

    const handleSend = async () => {
        if (!newNotice.recipient || !newNotice.title || !newNotice.content) return alert("Vui lòng nhập đủ thông tin!");
        if (newNotice.type === 'scheduled' && !newNotice.scheduledTime) return alert("Chưa chọn giờ gửi!");
        if (!selectAll && newNotice.specificIds.length === 0 && usersList.length > 0) return alert("Vui lòng chọn ít nhất 1 người nhận!");

        try {
            const payload = { ...newNotice, specificIds: selectAll ? [] : newNotice.specificIds };
            const res = await fetch(NOTIFICATION_API_URL, {
                method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload),
            });
            if (!res.ok) throw new Error("Lỗi gửi thông báo");
            alert((await res.json()).message);
            handleCancel(); fetchNotifications();
        } catch (e) { alert(e.message); }
    };

    const handleCancel = () => {
        setShowPopup(false);
        setNewNotice({ recipient: "", title: "", content: "", type: "manual", scheduledTime: "", isRecurring: false, recurrenceDays: [], specificIds: [] });
        setSearchTerm("");
    };

    const handleViewNotice = async (notice) => {
        setViewingNotice(notice);
        if (notice.status === 'unread') {
            await fetch(`${NOTIFICATION_API_URL}/${notice.id}/read`, { method: 'PATCH' });
            setNotifications(curr => curr.map(n => n.id === notice.id ? { ...n, status: 'read' } : n));
        }
    };

    const DAYS = [{ label: "CN", val: 0 }, { label: "T2", val: 1 }, { label: "T3", val: 2 }, { label: "T4", val: 3 }, { label: "T5", val: 4 }, { label: "T6", val: 5 }, { label: "T7", val: 6 }];

    return (
        <div className="thongbao-container" style={{height: "100%", width: "100%", display: "flex", flexDirection: "column"}}>
            <div className="thongbao-wrapper">
                <div className="thongbao-sidebar">
                    <button className="btn-create" onClick={() => setShowPopup(true)}>+ Tạo thông báo</button>
                    <select className="filter-select" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                        <option value="">Chọn lọc (Tất cả)</option>
                        <option value="unread">Chưa xem</option>
                        <option value="read">Đã xem</option>
                    </select>
                </div>

                <div className="thongbao-content">
                    <div className="tabs">
                        <button onClick={() => setActiveTab("all")} className={`tab ${activeTab === "all" ? "active" : ""}`}>Tất cả</button>
                        <button onClick={() => setActiveTab("bus")} className={`tab ${activeTab === "bus" ? "active" : ""}`}>Xe buýt</button>
                        <button onClick={() => setActiveTab("driver")} className={`tab ${activeTab === "driver" ? "active" : ""}`}>Tài xế</button>
                        <button onClick={() => setActiveTab("parent")} className={`tab ${activeTab === "parent" ? "active" : ""}`}>Phụ huynh</button>
                    </div>
                    <div className="content-box">
                        {notifications.length > 0 ? (
                            <ul className="notification-list">
                                {notifications.map(notif => (
                                    <li key={notif.id} className="notification-item" onClick={() => handleViewNotice(notif)}>
                                        <div className="notification-icon">🔔</div>
                                        <div className="notification-body">
                                            <strong className="notification-title">{notif.title}</strong>
                                            <p className="notification-content">{notif.content}</p>
                                            
                                            {/* SỬ DỤNG HÀM MỚI Ở ĐÂY */}
                                            {notif.type === 'scheduled' && <span className="schedule-tag">⏳ Hẹn giờ: {formatDateTime(notif.scheduled_time)}</span>}
                                        </div>
                                        {/* SỬ DỤNG HÀM MỚI Ở ĐÂY */}
                                        <small className="notification-time">{formatDateTime(notif.created_at)}</small>
                                    </li>
                                ))}
                            </ul>
                        ) : <p className="no-notifications">Không có thông báo nào</p>}
                    </div>
                </div>
            </div>

            {/* PHẦN POPUP GIỮ NGUYÊN NHƯ CŨ */}
            {showPopup && (
                <div className="popup-overlay">
                    <div className="popup large-popup">
                        <h2>Tạo thông báo mới</h2>
                        <div className="radio-group">
                            <label><input type="radio" name="type" value="manual" checked={newNotice.type === 'manual'} onChange={handleChange}/> Gửi ngay</label>
                            <label><input type="radio" name="type" value="scheduled" checked={newNotice.type === 'scheduled'} onChange={handleChange}/> Tự động / Hẹn giờ</label>
                        </div>
                        {newNotice.type === 'scheduled' && (
                            <div className="schedule-box">
                                <label>Thời gian gửi: <input type="datetime-local" name="scheduledTime" value={newNotice.scheduledTime} onChange={handleChange} /></label>
                                <label className="checkbox-inline"><input type="checkbox" name="isRecurring" checked={newNotice.isRecurring} onChange={handleChange} /> Lặp lại hàng tuần</label>
                                {newNotice.isRecurring && (
                                    <div className="days-grid">
                                        {DAYS.map(d => (
                                            <label key={d.val} className={`day-box ${newNotice.recurrenceDays.includes(d.val) ? 'selected' : ''}`}>
                                                <input type="checkbox" checked={newNotice.recurrenceDays.includes(d.val)} onChange={() => handleDayCheck(d.val)} hidden />{d.label}
                                            </label>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                        <label>Gửi đến:
                            <select name="recipient" value={newNotice.recipient} onChange={handleChange}>
                                <option value="">-- Chọn nhóm --</option>
                                <option value="driver">Tài xế</option>
                                <option value="parent">Phụ huynh</option>
                                <option value="bus">Hệ thống</option>
                            </select>
                        </label>
                        {usersList.length > 0 && (
                            <div className="user-selection-container">
                                <div className="select-all-header">
                                    <label className="select-all-label">
                                        <input type="checkbox" checked={selectAll} onChange={handleSelectAll} />
                                        <span>Tất cả ({usersList.length})</span>
                                    </label>
                                    <div className="search-input-wrapper">
                                        <input type="text" placeholder="Tìm mã hoặc tên..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                                        <span className="search-icon">🔍</span>
                                    </div>
                                </div>
                                <div className="user-list-body">
                                    {filteredUsers.length > 0 ? filteredUsers.map(u => (
                                        <label key={u.id} className="user-item">
                                            <input type="checkbox" checked={selectAll ? true : newNotice.specificIds.includes(u.id)} disabled={selectAll} onChange={() => handleUserCheck(u.id)} />
                                            <span className="user-info"><span className="user-id">[{u.id}]</span> <span className="user-name">{u.name}</span></span>
                                        </label>
                                    )) : <div className="no-result">Không tìm thấy "{searchTerm}"</div>}
                                </div>
                            </div>
                        )}
                        {(newNotice.recipient === 'driver' || newNotice.recipient === 'parent') && usersList.length === 0 && <p style={{color:'red', fontSize:'13px', fontStyle:'italic'}}>Không tìm thấy dữ liệu.</p>}
                        <label>Tiêu đề: <input type="text" name="title" value={newNotice.title} onChange={handleChange} /></label>
                        <label>Nội dung: <textarea name="content" value={newNotice.content} onChange={handleChange} rows={4} /></label>
                        <div className="popup-buttons">
                            <button className="btn-send" onClick={handleSend}>{newNotice.type === 'scheduled' ? 'Lên lịch' : 'Gửi'}</button>
                            <button className="btn-cancel" onClick={handleCancel}>Hủy</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}