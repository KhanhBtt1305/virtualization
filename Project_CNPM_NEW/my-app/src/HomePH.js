import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Profile from './Profile';
import BusLine from './BusLine';
import BusTracking from './BusTracking';
import Notification from './Notification';
import About from './About';
import homeIcon from './icon/home.png';
import profileIcon from './icon/profile.png';
import stationIcon from './icon/station.png';
import busIcon from './icon/bus.png';
import notificationIcon from './icon/notification.png';
import aboutIcon from './icon/about.png';
import onlineIcon from './icon/online.png';
import vitriIcon from './icon/vitri.png';
import stopIcon from './icon/stop.png';

const HomePH = () => {
  const [activeTab, setActiveTab] = useState('trang-chu');
  const [isEditing, setIsEditing] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  
  const [homeData, setHomeData] = useState({
    license_plate: 'Dang tai...', route_name: 'Dang cap nhat...', status: '...', route_id: null
  });
  
  const [selectedTrackingId, setSelectedTrackingId] = useState(null);
  const [userInfo, setUserInfo] = useState({ name: '...', phone: '...' });

  useEffect(() => {
    if (location.state && location.state.activeTab) {
        setActiveTab(location.state.activeTab);
        if (location.state.routeId) {
            setSelectedTrackingId(location.state.routeId);
        }
        window.history.replaceState({}, document.title);
    }
  }, [location]);

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
        const user = JSON.parse(userStr);
        fetch(`http://localhost:8081/api/profile?id=${user.linked_id}`)
          .then(res => res.json())
          .then(data => {
            if (data && data.parent_id) {
                setUserInfo(data);
                fetch(`http://localhost:8081/api/home-summary?parentId=${data.parent_id}`)
                    .then(r => r.json())
                    .then(d => {
                        if(d && d.route_id) setHomeData(d);
                    });
            }
          });
    } else {
        navigate('/');
    }
  }, [navigate]);

  const handleLogout = () => {
      localStorage.removeItem('user');
      navigate('/');
  };

  const menuItems = [
    { id: 'trang-chu', label: 'Trang chủ', icon: homeIcon },
    { id: 'thong-tin', label: 'Thông tin cá nhân', icon: profileIcon },
    { id: 'tuyen-xe', label: 'Tuyến xe', icon: stationIcon },
    { id: 'theo-doi', label: 'Theo dõi xe buýt', icon: busIcon },
    { id: 'thong-bao', label: 'Thông báo', icon: notificationIcon },
    { id: 'gioi-thieu', label: 'Giới thiệu', icon: aboutIcon }
  ];

  const styles = {
    app: { display: 'flex', height: '100vh', fontFamily: "'Segoe UI', sans-serif", backgroundColor: '#f5f5f5' },
    sidebar: { width: '300px', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white', padding: '20px', display: 'flex', flexDirection: 'column' },
    logo: { textAlign: 'center', marginBottom: '30px' },
    logoText: { fontSize: '24px', fontWeight: 'bold', margin: 0 },
    userInfo: { display: 'flex', alignItems: 'center', marginBottom: '30px', background: 'rgba(255, 255, 255, 0.1)', padding: '15px', borderRadius: '10px' },
    avatar: { width: '50px', height: '50px', borderRadius: '50%', overflow: 'hidden', marginRight: '15px', background: 'rgba(255, 255, 255, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' },
    avatarImg: { width: '100%', height: '100%', objectFit: 'cover' },
    userDetails: { flex: 1 },
    userName: { fontSize: '16px', marginBottom: '5px', margin: 0 },
    userText: { fontSize: '12px', opacity: '0.8', marginBottom: '2px', margin: 0 },
    menu: { flex: 1 },
    menuItem: { display: 'flex', alignItems: 'center', padding: '15px', marginBottom: '10px', borderRadius: '8px', cursor: 'pointer', transition: 'all 0.3s ease' },
    menuItemActive: { background: 'rgba(255, 255, 255, 0.2)', borderLeft: '4px solid white' },
    menuIcon: { width: '20px', height: '20px', marginRight: '15px', filter: 'brightness(0) invert(1)' },
    mainContent: { flex: 1, padding: '30px', overflowY: 'auto', backgroundColor: 'white' },
    container: { padding: '20px', maxWidth: '1000px', margin: '0 auto' },
    header: { color: '#333', fontSize: '28px', fontWeight: 'bold', marginBottom: '30px', borderBottom: '2px solid #667eea', paddingBottom: '10px' },
    statusSection: { backgroundColor: '#f8f9fa', padding: '25px', borderRadius: '10px', marginBottom: '30px', borderLeft: '4px solid #28a745' },
    statusTitle: { color: '#28a745', fontSize: '20px', fontWeight: 'bold', marginBottom: '25px', display: 'flex', alignItems: 'center' },
    statusIcon: { width: '24px', height: '24px', marginRight: '10px' },
    statusGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginTop: '20px' },
    statusCard: { backgroundColor: 'white', border: '1px solid #e9ecef', borderRadius: '8px', padding: '20px', textAlign: 'center' },
    statusCardTitle: { fontSize: '16px', fontWeight: 'bold', color: '#495057', marginBottom: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' },
    statusCardValue: { fontSize: '14px', color: '#6c757d', lineHeight: '1.4' },
    divider: { height: '1px', backgroundColor: '#dee2e6', margin: '25px 0' },
    quickActions: { marginTop: '30px' },
    quickActionsTitle: { color: '#333', fontSize: '24px', fontWeight: 'bold', marginBottom: '20px' },
    actionGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginTop: '20px' },
    actionCard: { backgroundColor: 'white', border: '1px solid #e9ecef', borderRadius: '10px', padding: '25px', textAlign: 'center', cursor: 'pointer', transition: 'all 0.3s ease', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' },
    actionTitle: { color: '#333', fontSize: '18px', fontWeight: '600', marginBottom: '10px' },
    actionDescription: { color: '#6c757d', fontSize: '14px', lineHeight: '1.4' },
    logoutButton: { marginTop: 'auto', padding: '10px', backgroundColor: '#ff4757', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }
  };

  const renderContent = () => {
    switch(activeTab) {
      case 'trang-chu':
        return (
          <div style={styles.container}>
            <h1 style={styles.header}>TRẠNG THÁI TUYẾN XE</h1>
            <div style={styles.statusSection}>
              <h2 style={styles.statusTitle}>
                <img src={onlineIcon} alt="Online" style={styles.statusIcon} />
                {homeData.route_name} - {homeData.status}
              </h2>
              <div style={styles.statusGrid}>
                <div style={styles.statusCard}>
                  <div style={styles.statusCardTitle}>
                    <img src={onlineIcon} alt="Tuyến" style={{width: '20px', height: '20px'}} />
                    Thông tin xe
                  </div>
                  <div style={styles.statusCardValue}>
                    Biển số: {homeData.license_plate}<br/>
                    Mã xe: {homeData.bus_id}
                  </div>
                </div>
                <div 
                    style={{...styles.statusCard, cursor: 'pointer', borderColor: '#667eea'}} 
                    onClick={() => {
                        if(homeData.route_id) {
                            setSelectedTrackingId(homeData.route_id);
                            setActiveTab('theo-doi'); 
                        }
                        else alert("Chưa có thông tin tuyến!");
                    }}
                >
                  <div style={styles.statusCardTitle}>
                    <img src={vitriIcon} alt="Vị trí" style={{width: '20px', height: '20px'}} />
                    Vị trí hiện tại
                  </div>
                  <div style={{...styles.statusCardValue, color: '#667eea', fontWeight: 'bold'}}>
                    Xem bản đồ
                  </div>
                </div>
                <div style={styles.statusCard}>
                  <div style={styles.statusCardTitle}>
                    <img src={stopIcon} alt="Điểm dừng" style={{width: '20px', height: '20px'}} />
                    Tuyến
                  </div>
                  <div style={styles.statusCardValue}>{homeData.route_name}</div>
                </div>
              </div>
            </div>
            <div style={styles.divider}></div>
            <div style={styles.quickActions}>
              <h2 style={styles.quickActionsTitle}>THAO TÁC NHANH</h2>
              <div style={styles.actionGrid}>
                <div style={styles.actionCard} onClick={() => {
                    if(homeData.route_id) setSelectedTrackingId(homeData.route_id);
                    setActiveTab('theo-doi');
                }}>
                  <h3 style={styles.actionTitle}>Theo dõi xe buýt</h3>
                  <p style={styles.actionDescription}>Xem bản đồ trực tuyến</p>
                </div>
                <div style={styles.actionCard} onClick={() => setActiveTab('thong-tin')}>
                  <h3 style={styles.actionTitle}>Hồ sơ cá nhân</h3>
                  <p style={styles.actionDescription}>Quản lý thông tin tài khoản</p>
                </div>
                <div style={styles.actionCard} onClick={() => setActiveTab('thong-bao')}>
                  <h3 style={styles.actionTitle}>Thông báo</h3>
                  <p style={styles.actionDescription}>Xem tin tức mới nhất</p>
                </div>
              </div>
            </div>
          </div>
        );
      
      case 'theo-doi': 
        return <BusTracking propRouteId={selectedTrackingId || homeData.route_id} />;
      
      case 'thong-tin': return <Profile userInfo={userInfo} setUserInfo={setUserInfo} isEditing={isEditing} setIsEditing={setIsEditing} />;
      case 'tuyen-xe': return <BusLine />;
      case 'thong-bao': return <Notification />;
      case 'gioi-thieu': return <About />;
      default: return <div>Trang không tồn tại</div>;
    }
  };

  return (
    <div style={styles.app}>
      <div style={styles.sidebar}>
        <div style={styles.logo}><h1 style={styles.logoText}>SSB</h1></div>
        <div style={styles.userInfo}>
          <div style={styles.avatar}>
             <img src={profileIcon} alt="User" style={styles.avatarImg} onError={(e) => {e.target.style.display='none'}} />
          </div>
          <div style={styles.userDetails}>
            <h3 style={styles.userName}>{userInfo.name || 'Người dùng'}</h3>
            <p style={styles.userText}>{userInfo.phone}</p>
          </div>
        </div>
        <nav style={styles.menu}>
          {menuItems.map(item => (
            <div key={item.id} 
                 style={{...styles.menuItem, ...(activeTab === item.id ? styles.menuItemActive : {})}}
                 onClick={() => {
                     setActiveTab(item.id); 
                     setIsEditing(false);
                     if(item.id !== 'theo-doi') setSelectedTrackingId(null);
                 }}>
              <img src={item.icon} alt={item.label} style={styles.menuIcon}/>
              <span>{item.label}</span>
            </div>
          ))}
        </nav>
        <button style={styles.logoutButton} onClick={handleLogout}>Đăng xuất</button>
      </div>
      <div style={styles.mainContent}>{renderContent()}</div>
    </div>
  );
};

export default HomePH;