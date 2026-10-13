import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const BusLineDetail = ({ routeId: propRouteId }) => {
  const { id } = useParams(); 
  const navigate = useNavigate();
  const routeId = propRouteId || id;

  const [stops, setStops] = useState([]);
  const [routeInfo, setRouteInfo] = useState({ name: 'Dang tai...', id: routeId });
  const [currentSchedule, setCurrentSchedule] = useState(null);
  const [students, setStudents] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  
  const [activeBuses, setActiveBuses] = useState([]);
  const [selectedBusId, setSelectedBusId] = useState(null);

  const [busStatus, setBusStatus] = useState({ stopId: null, isMoving: false, nextStop: '', hasData: false });

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (!userStr) navigate('/'); 
    else setCurrentUser(JSON.parse(userStr));
  }, [navigate]);

  // 1. Lấy danh sách xe
  useEffect(() => {
      if(routeId) {
          fetch(`http://localhost:8081/api/active-buses-by-route?id=${routeId}`)
            .then(res => res.json())
            .then(data => {
                setActiveBuses(data);
                if (data.length > 0) setSelectedBusId(data[0].bus_id);
            })
            .catch(err => console.error(err));
      }
  }, [routeId]);

  // 2. Lấy vị trí xe
  useEffect(() => {
    if (!selectedBusId) return;
    const fetchBusStatus = () => {
        fetch(`http://localhost:8081/api/bus-locations?busId=${selectedBusId}`)
            .then(res => res.json())
            .then(data => {
                if (data.length > 0) {
                    const bus = data[0];
                    setBusStatus({ stopId: bus.nearest_stop_id, isMoving: bus.is_moving, nextStop: bus.next_stop_name, hasData: true });
                } else {
                    setBusStatus({ hasData: false });
                }
            });
    };
    fetchBusStatus();
    const interval = setInterval(fetchBusStatus, 2000);
    return () => clearInterval(interval);
  }, [selectedBusId]);

  // 3. Lấy thông tin tài xế & Lịch trình
  useEffect(() => {
      if(selectedBusId) {
        fetch(`http://localhost:8081/api/bus-schedule-info?busId=${selectedBusId}`)
            .then(res => res.json())
            .then(data => { 
                if (data && data.schedule_id) setCurrentSchedule(data); 
                else setCurrentSchedule(null);
            });
      }
  }, [selectedBusId]);

  // 4. Lấy danh sách học sinh (KHI ĐÃ CÓ LỊCH TRÌNH)
  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (routeId && userStr && currentSchedule) {
        const user = JSON.parse(userStr);
        fetch(`http://localhost:8081/api/route-students-status?id=${routeId}&parentId=${user.linked_id}&scheduleId=${currentSchedule.schedule_id}`)
            .then(res => res.json())
            .then(data => setStudents(data));
    }
  }, [routeId, currentSchedule]);

  // Load thông tin tuyến
  useEffect(() => {
    if (routeId) {
        fetch(`http://localhost:8081/api/route-detail?id=${routeId}`)
            .then(res => res.json()).then(data => { setStops(data); if (data.length > 0) setRouteInfo({ name: data[0].route_name, id: routeId }); });
    }
  }, [routeId]);

  // Hàm cập nhật trạng thái
  const handleStatusChange = (studentId, newStatus, stopId) => { 
      if (!currentSchedule) {
          alert("Chưa có lịch trình hoạt động.");
          return;
      }

      // Cập nhật hiển thị ngay lập tức (Optimistic UI)
      setStudents(prev => prev.map(s => s.student_id === studentId ? {...s, pickup_status: newStatus} : s));

      const payload = { 
          student_id: studentId, 
          status: newStatus, 
          driver_id: currentSchedule.driver_id, 
          schedule_id: currentSchedule.schedule_id, 
          stop_id: stopId 
      }; 
      
      fetch('http://localhost:8081/api/update-student-status', { 
          method: 'POST', 
          headers: { 'Content-Type': 'application/json' }, 
          body: JSON.stringify(payload) 
      })
      .then(res => res.json())
      .then(() => { 
          // Có thể fetch lại để đảm bảo đồng bộ
          const userStr = localStorage.getItem('user'); 
          if (userStr) {
              const user = JSON.parse(userStr);
              fetch(`http://localhost:8081/api/route-students-status?id=${routeId}&parentId=${user.linked_id}&scheduleId=${currentSchedule.schedule_id}`)
                .then(r => r.json()).then(d => setStudents(d));
          }
      }); 
  };

  const studentsWaiting = students.filter(s => !s.pickup_status || s.pickup_status === 'Chưa lên xe');
  const studentsOnBus = students.filter(s => s.pickup_status && s.pickup_status !== 'Chưa lên xe');

  const styles = {
    container: { padding: '30px', maxWidth: '800px', margin: '0 auto', fontFamily: "'Segoe UI', sans-serif", backgroundColor: '#f9f9f9', minHeight: '100vh' },
    header: { marginBottom: '20px', paddingBottom: '15px', borderBottom: '2px solid #667eea' },
    headerTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
    busNumber: { fontSize: '32px', fontWeight: 'bold', color: '#667eea', marginRight: '15px' },
    stationName: { fontSize: '22px', fontWeight: 'bold', color: '#333' },
    busSelect: { padding: '8px', borderRadius: '5px', border: '1px solid #ccc', fontSize: '16px', fontWeight: 'bold', color: '#333', backgroundColor: '#fff', cursor: 'pointer', marginTop: '10px' },
    movingStatus: { backgroundColor: '#e3f2fd', color: '#0d47a1', padding: '10px 15px', borderRadius: '8px', marginBottom: '20px', fontWeight: '500', fontSize: '14px', borderLeft: '4px solid #2196f3' },
    stationList: { marginLeft: '10px', borderLeft: '2px solid #eee', paddingLeft: '20px' },
    stationItem: { marginBottom: '20px', position: 'relative' },
    stationDot: (isHere) => ({ position: 'absolute', left: '-27px', top: '5px', width: '12px', height: '12px', backgroundColor: isHere ? '#28a745' : '#667eea', borderRadius: '50%', border: '2px solid white', boxShadow: isHere ? '0 0 0 2px #28a745' : 'none', transition: 'background-color 0.3s ease' }),
    stationNameText: (isHere) => ({ fontWeight: 'bold', color: isHere ? '#28a745' : '#333', transition: 'color 0.3s ease' }),
    section: { marginBottom: '25px', backgroundColor: 'white', padding: '20px', borderRadius: '10px', boxShadow: '0 2px 5px rgba(0,0,0,0.05)' },
    sectionTitle: { fontSize: '16px', fontWeight: 'bold', color: '#495057', marginBottom: '15px', borderLeft: '4px solid #667eea', paddingLeft: '10px' },
    infoGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' },
    infoLabel: { fontWeight: 'bold', color: '#666', display: 'block', marginBottom: '5px' },
    infoValue: { fontSize: '15px', fontWeight: '500' },
    studentGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' },
    studentColumn: { backgroundColor: '#f8f9fa', padding: '15px', borderRadius: '8px', border: '1px solid #eee' },
    colTitle: { fontSize: '14px', fontWeight: 'bold', marginBottom: '10px', textAlign: 'center', color: '#555' },
    studentItem: { marginBottom: '10px', padding: '10px', backgroundColor: 'white', borderRadius: '6px', border: '1px solid #e0e0e0', boxShadow: '0 1px 2px rgba(0,0,0,0.03)' },
    studentName: { fontWeight: 'bold', fontSize: '14px', color: '#333' },
    studentStop: { fontSize: '12px', color: '#888', marginBottom: '8px' },
    selectBox: { width: '100%', padding: '6px', borderRadius: '4px', border: '1px solid #ccc', fontSize: '13px', backgroundColor: '#fff', cursor: 'pointer' },
    statusColor: (status) => { if (status === 'Đã lên xe') return { color: '#007bff' }; if (status === 'Đã đến trường') return { color: '#28a745' }; return { color: '#6c757d' }; },
    emptyMsg: { textAlign: 'center', color: '#999', fontSize: '13px', fontStyle: 'italic', padding: '20px 0' },
    warningBox: { padding: '10px', backgroundColor: '#fff3cd', color: '#856404', borderRadius: '5px', marginBottom: '20px', border: '1px solid #ffeeba', fontSize: '14px' }
  };

  const StatusSelect = ({ student }) => (
    <select style={styles.selectBox} value={student.pickup_status || 'Chưa lên xe'} onChange={(e) => handleStatusChange(student.student_id, e.target.value, student.stop_id)} disabled={!currentSchedule}>
        <option value="Chưa lên xe">Chưa lên xe</option><option value="Đã lên xe">Đã lên xe</option><option value="Đã đến trường">Đã đến trường</option><option value="Đã về nhà">Đã về nhà</option>
    </select>
  );

  if (!routeId) return <div style={{padding: '20px', textAlign: 'center'}}>Vui lòng chọn tuyến xe...</div>;

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div style={styles.headerTop}>
            <div style={{display: 'flex', alignItems: 'center'}}>
                <div style={styles.busNumber}>#{routeInfo.id}</div>
                <div style={styles.stationName}>{routeInfo.name}</div>
            </div>
            <button style={{padding: '4px 10px', fontSize: '12px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer'}} onClick={() => navigate('/home', { state: { activeTab: 'theo-doi', routeId: routeId } })}>Xem vị trí xe</button>
        </div>
        
        {activeBuses.length > 0 ? (
            <div style={{marginTop: '15px'}}>
                <label style={{marginRight: '10px', fontWeight: 'bold'}}>Chọn xe:</label>
                <select style={styles.busSelect} value={selectedBusId || ''} onChange={(e) => setSelectedBusId(e.target.value)}>
                    {activeBuses.map(bus => <option key={bus.bus_id} value={bus.bus_id}>{bus.license_plate} ({bus.bus_id})</option>)}
                </select>
            </div>
        ) : (
            <div style={{marginTop: '10px', color: '#dc3545', fontStyle: 'italic'}}>Không có xe nào đang hoạt động trên tuyến này.</div>
        )}
      </div>

      {busStatus.hasData && busStatus.isMoving && (
          <div style={styles.movingStatus}>Xe đang di chuyển đến: <b>{busStatus.nextStop}</b></div>
      )}
      
      <div style={styles.section}>
        <div style={styles.sectionTitle}>Thông tin hành trình</div>
        <div style={styles.infoGrid}>
            <div><span style={styles.infoLabel}>Tài xế phụ trách</span><div style={styles.infoValue}>{currentSchedule ? currentSchedule.name : '---'}</div></div>
            <div><span style={styles.infoLabel}>Ngày khởi hành</span><div style={styles.infoValue}>{currentSchedule ? new Date(currentSchedule.schedule_date).toLocaleDateString('vi-VN') : '---'}</div></div>
        </div>
      </div>

      <div style={styles.section}>
        <div style={styles.sectionTitle}>Các trạm dừng</div>
        <div style={styles.stationList}>
            {stops.length > 0 ? stops.map((stop, index) => {
                const isHere = busStatus.stopId === stop.stop_id;
                return (
                    <div key={index} style={styles.stationItem}>
                        <div style={styles.stationDot(isHere)}></div>
                        <div style={styles.stationNameText(isHere)}>{stop.stop_name}</div>
                        <div style={{fontSize: '13px', color: '#666'}}>{stop.address}</div>
                        {isHere && <div style={{color: '#28a745', fontSize: '12px', marginTop: '2px', fontWeight: 'bold'}}>Xe đang dừng tại đây</div>}
                    </div>
                );
            }) : <p style={{fontStyle: 'italic', color: '#999'}}>Đang cập nhật trạm...</p>}
        </div>
      </div>

      <div style={styles.section}>
        <div style={styles.sectionTitle}>Quản lý đưa đón học sinh</div>
        <div style={styles.studentGrid}>
            <div style={styles.studentColumn}>
                <div style={styles.colTitle}>Chờ đón ({studentsWaiting.length})</div>
                {studentsWaiting.map(s => (
                    <div key={s.student_id} style={styles.studentItem}>
                        <div style={styles.studentName}>{s.name}</div>
                        <div style={styles.studentStop}>Trạm: {s.stop_name}</div>
                        <StatusSelect student={s} />
                    </div>
                ))}
            </div>
            <div style={styles.studentColumn}>
                <div style={styles.colTitle}>Đã lên xe / Hoàn thành ({studentsOnBus.length})</div>
                {studentsOnBus.map(s => (
                    <div key={s.student_id} style={styles.studentItem}>
                        <div style={styles.studentName}>{s.name}</div>
                        <div style={{...styles.studentStop, ...styles.statusColor(s.pickup_status), fontWeight: 'bold'}}>{s.pickup_status}</div>
                        <StatusSelect student={s} />
                    </div>
                ))}
            </div>
        </div>
      </div>
    </div>
  );
};

export default BusLineDetail;