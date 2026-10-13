import React, { useState, useEffect } from 'react';
import BusLineDetail from './BusLineDetail';

const BusLine = () => {
  const [selectedRouteId, setSelectedRouteId] = useState(null);
  const [routes, setRoutes] = useState([]);

  //GỌI API LẤY DANH SÁCH TUYẾN
  useEffect(() => {
    fetch('http://localhost:8081/api/routes')
      .then(res => res.json())
      .then(data => setRoutes(data))
      .catch(err => console.error(err));
  }, []);

  // BusLineDetail
  if (selectedRouteId) {
    return (
      <div>
        <button 
          onClick={() => setSelectedRouteId(null)}
          style={{ padding: '10px 20px', background: '#6c757d', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', marginBottom: '20px' }}
        >
          ← Quay lại danh sách
        </button>
        <BusLineDetail routeId={selectedRouteId} />
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h1 style={{ color: '#333', borderBottom: '2px solid #667eea', paddingBottom: '10px' }}>DANH SÁCH TUYẾN XE</h1>
      
      {routes.length === 0 && <p>Đang tải dữ liệu hoặc chưa có tuyến nào...</p>}

      {routes.map((route) => (
        <div 
          key={route.route_id} 
          onClick={() => setSelectedRouteId(route.route_id)}
          style={{
            backgroundColor: 'white',
            border: '1px solid #e9ecef',
            borderRadius: '10px',
            padding: '20px',
            marginBottom: '20px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            cursor: 'pointer',
            transition: 'transform 0.2s'
          }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-3px)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #eee', paddingBottom: '10px', marginBottom: '10px' }}>
            <span style={{ fontSize: '24px', fontWeight: 'bold', color: '#667eea' }}>{route.route_id}</span>
            <span style={{ padding: '4px 12px', background: '#28a745', color: 'white', borderRadius: '20px', fontSize: '12px' }}>ĐANG HOẠT ĐỘNG</span>
          </div>

          <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#333', marginBottom: '10px' }}>
            {route.route_name}
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#555', fontSize: '14px' }}>
             <div>Điểm bắt đầu: <b>{route.start_point}</b></div>
             <div>Điểm đến: <b>{route.end_point}</b></div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default BusLine;