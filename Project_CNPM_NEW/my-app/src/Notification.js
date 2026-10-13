import React, { useState, useEffect } from 'react';

const Notification = () => {
  const [notifications, setNotifications] = useState([]);

  // GỌI API LẤY THÔNG BÁO
  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = () => {
    fetch('http://localhost:8081/api/notifications')
      .then(res => res.json())
      .then(data => {
        const formattedData = data.map(item => ({
          id: item.id,
          title: item.title,
          message: item.content,
          time: new Date(item.created_at).toLocaleString('vi-VN'),
          read: item.status === 'read',
          type: item.recipient_type, 
          label: item.notificationFor // Lấy cột "Phụ huynh" để hiển thị
        }));
        setNotifications(formattedData);
      })
      .catch(err => console.error("Lỗi lấy thông báo:", err));
  };

  // ĐÁNH DẤU ĐÃ ĐỌC
  const markAsRead = (id) => {
    setNotifications(notifications.map(notif => 
      notif.id === id ? { ...notif, read: true } : notif
    ));

    fetch(`http://localhost:8081/api/notifications/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'read' })
    });
  };

  // ĐÁNH DẤU TẤT CẢ
  const markAllAsRead = () => {
    setNotifications(notifications.map(notif => ({ ...notif, read: true })));
    fetch('http://localhost:8081/api/notifications-mark-all', { method: 'PUT' });
  };

  // XÓA THÔNG BÁO
  const deleteNotification = (id) => {
    if(window.confirm("Bạn muốn xóa thông báo này?")) {
        setNotifications(notifications.filter(notif => notif.id !== id));
        fetch(`http://localhost:8081/api/notifications/${id}`, { method: 'DELETE' });
    }
  };

  const styles = {
    container: { padding: '20px', maxWidth: '800px', margin: '0 auto' },
    header: { color: '#333', fontSize: '28px', fontWeight: 'bold', marginBottom: '30px', borderBottom: '2px solid #667eea', paddingBottom: '10px' },
    notificationCard: { backgroundColor: 'white', border: '1px solid #e9ecef', borderRadius: '10px', padding: '20px', marginBottom: '15px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', cursor: 'pointer', transition: 'all 0.3s ease' },
    notificationUnread: { borderLeft: '4px solid #667eea', backgroundColor: '#f8f9ff' },
    notificationRead: { borderLeft: '4px solid #dee2e6', opacity: 0.8 },
    notificationHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' },
    notificationTitle: { fontSize: '16px', fontWeight: 'bold', color: '#333', margin: 0, flex: 1 },
    notificationTime: { fontSize: '12px', color: '#6c757d', margin: 0, minWidth: '120px', textAlign: 'right' },
    notificationMessage: { fontSize: '14px', color: '#6c757d', lineHeight: '1.5', margin: '0 0 10px 0' },
    notificationBadge: { display: 'inline-block', padding: '2px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: '500', marginRight: '8px' },
    badgeDefault: { backgroundColor: '#ffc107', color: '#212529' }, 
    
    badgeUnread: { backgroundColor: '#dc3545', color: 'white', fontSize: '10px', padding: '1px 6px' },
    emptyState: { textAlign: 'center', padding: '40px 20px', color: '#6c757d' },
    emptyIcon: { fontSize: '48px', marginBottom: '15px', opacity: 0.5 },
    actionButtons: { display: 'flex', gap: '10px', marginBottom: '20px' },
    actionButton: { padding: '8px 16px', border: 'none', borderRadius: '5px', cursor: 'pointer', fontSize: '14px', fontWeight: '500' },
    primaryButton: { backgroundColor: '#667eea', color: 'white' }
  };

  const unreadCount = notifications.filter(notif => !notif.read).length;

  return (
    <div style={styles.container}>
      <h1 style={styles.header}>THÔNG BÁO</h1>

      <div style={styles.actionButtons}>
        <button 
          style={{...styles.actionButton, ...styles.primaryButton}}
          onClick={markAllAsRead}
          disabled={unreadCount === 0}
        >
          Đánh dấu tất cả đã đọc
        </button>
        <div style={{flex: 1}}></div>
        <span style={{color: '#6c757d', fontSize: '14px'}}>
          {unreadCount} thông báo chưa đọc
        </span>
      </div>

      {notifications.length === 0 ? (
        <div style={styles.emptyState}>
          <div style={styles.emptyIcon}>📭</div>
          <h3>Không có thông báo</h3>
          <p>Hiện tại chưa có thông báo nào dành cho Phụ huynh</p>
        </div>
      ) : (
        notifications.map(notification => (
          <div
            key={notification.id}
            style={{
              ...styles.notificationCard,
              ...(notification.read ? styles.notificationRead : styles.notificationUnread)
            }}
            onClick={() => markAsRead(notification.id)}
          >
            <div style={styles.notificationHeader}>
              <h3 style={styles.notificationTitle}>
                <span style={{...styles.notificationBadge, ...styles.badgeDefault}}>
                  {notification.label}
                </span>
                {notification.title}
                {!notification.read && (
                  <span style={{...styles.badgeUnread, marginLeft: '8px'}}>MỚI</span>
                )}
              </h3>
              <span style={styles.notificationTime}>{notification.time}</span>
            </div>
            <p style={styles.notificationMessage}>{notification.message}</p>
            
            <button
              style={{
                ...styles.actionButton,
                backgroundColor: 'transparent',
                color: '#dc3545',
                border: '1px solid #dc3545',
                padding: '4px 12px',
                fontSize: '12px'
              }}
              onClick={(e) => {
                e.stopPropagation();
                deleteNotification(notification.id);
              }}
            >
              Xóa
            </button>
          </div>
        ))
      )}
    </div>
  );
};

export default Notification;