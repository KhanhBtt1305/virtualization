import './style.css';
import React, { useEffect, useState, useMemo } from 'react';
import BusRoute from './component/bus_route';
import { Route,defaultRoutes } from "../../../models/Route";
import { Time } from '../../../models/Time';
import AddRoute from './component/AddRoute';
import StyleMain from './../styleMain.module.css';
import { RouteDetail } from './component/formdetails/Detail_Route';
function renderRoutesTable(routes,handleViewDetail) {
  return routes.map((route) => (
    <BusRoute route={route} onViewDetail={handleViewDetail}/>
  ));
}
function formatNumber2(value) {
  if (value === null || value === undefined || value === '') return '0.00';
  const n = Number(value);
  if (Number.isNaN(n)) return String(value);
  return n.toFixed(2);
}
function parseTimeToModel(inputTime, fallback="00:00") {
    // inputTime có thể là chuỗi "HH:MM" hoặc đối tượng Date
    if (typeof inputTime === 'string') {
      const parts = inputTime.split(':');
      if (parts.length === 2) {
        const hours = parseInt(parts[0], 10);
        const minutes = parseInt(parts[1], 10);
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
      }
      return fallback;
    } else if (inputTime instanceof Date) {
      const hours = inputTime.getHours();
      const minutes = inputTime.getMinutes();
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    } else {
      return fallback;
    }   
  }

function totalRouteStable(array){
  return array.filter(route=>route.status==="active").length
}
function totalDistance(array){
  return formatNumber2(array.reduce((sum,route)=>sum+parseKm(route.distance_km),0))
}
function parseKm(val) {
    if (val == null) return 0;
    if (typeof val === 'number') return val;
    if (typeof val === 'string') {
      const m = val.match(/[\d,.]+/);
      if (!m) return 0;
      return Number(m[0].replace(',', '.'));
    }
    return 0;
  }
function RouteManagementPage() {
  const [routes, setRoutes] = useState([]);
  const [filter, setFilter] = useState('all'); // <-- new state for filter
  const [showDetail, setShowDetail] = useState({key:false,value:null});
  const [showaddroute, setShowAddRoute] = useState(false);
  useEffect(() => {
    // ví dụ: lấy từ API hoặc dữ liệu tĩnh
    setRoutes(defaultRoutes);
  }, []);
  function editRoute(updated) {
    setRoutes(prev => prev.map(r => {
      // match by route_id first, fallback to route_code
      const matchId = (updated.route_id != null && r.route_id === updated.route_id);
      const matchCode = (!matchId && updated.route_code && r.route_code === updated.route_code);
      if (matchId || matchCode) {
        // keep created_at, update updated_at
        return new Route(
          updated.route_id ?? r.route_id,
          updated.route_code ?? r.route_code,
          updated.route_name ?? r.route_name,
          updated.start_location ?? r.start_location,
          updated.end_location ?? r.end_location,
          updated.planned_start ? parseTimeToModel(updated.planned_start, r.planned_start) : r.planned_start,
          updated.planned_end ? parseTimeToModel(updated.planned_end, r.planned_end) : r.planned_end,
          Number(updated.total_students ?? r.total_students),
          updated.distance_km ?? r.distance_km,
          Number(updated.estimated_duration_minutes ?? r.estimated_duration_minutes),
          updated.status ?? r.status,
          r.created_at,
          new Date()
        );
      }
      return r;
    }));}
  const cancelShowAddRoute = () => {
    setShowAddRoute(false);
  }
  const handleSaveRoute = (newRoute) => {
    editRoute(newRoute);
    setShowDetail({key:false,value:null});
  }
  const handleViewDetail = (route) => {
    setShowDetail({key:true,value: route});
    console.log('Viewing details for route:', route);
  }
  // filter logic
  const filteredRoutes = useMemo(() => {
    console.log('Filtering routes with filter:', filter);
    if (filter === 'all') return routes;
    return routes.filter(r => String(r.status).toLowerCase() === String(filter).toLowerCase());
  }, [routes, filter]);
  // tổng chiều dài cho tất cả routes
  const totalDistanceAll = totalDistance(routes)
  const totalDistanceVisible = totalDistance(filteredRoutes)
  const totalRouteStableinlive = totalRouteStable(routes)
  return (
    
    <div className="container-route-management">
      {!showaddroute && 
      <>
      <header>
        <div className={StyleMain.row_direction} style={{justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h1 className={StyleMain.setTitle_h1}><i className="fas fa-route" /> Quản Lý Tuyến Xe</h1>
            <p className="description">Quản lý và theo dõi các tuyến xe hiện có một cách hiệu quả và trực quan</p>
          </div>
          <div><button style={{ color: "white" }} onClick={()=>{setShowAddRoute(true);}}>➕ Thêm Tuyến xe</button></div>
        </div>
      </header>

      <div className={"dashboard-route " + StyleMain.row_direction}>
        <div className="card">
          <i className="fas fa-bus" />
          <h3>Tổng số tuyến xe</h3>
          <div className="number">{routes.length}</div>
        </div>
        <div className="card">
          <i className="fas fa-check-circle" />
          <h3>Tuyến đang hoạt động</h3>
          <div className="number">{totalRouteStableinlive}</div>
        </div>
        <div className="card">
          <i className="fas fa-exclamation-triangle" />
          <h3>Tuyến cần chú ý</h3>
          <div className="number">{routes.length-totalRouteStableinlive}</div>
        </div>
        <div className="card">
          <i className="fas fa-road" />
          <h3>Tổng quãng đường</h3>
          <div className="number">{totalDistanceAll}</div>
          <div style={{fontSize:12,color:'#6b7280'}}>Hiển thị: {totalDistanceVisible} km</div>
        </div>
      </div>

      <div className="controls">
        <div className="search-container">
          <i className="fas fa-search" />
          <input style={{fontSize:"1.1em"}} type="text" className="search-box" placeholder="Tìm kiếm tuyến xe..." />
        </div>
        <div className="filter-container">
          <i className="fas fa-filter" />
          <select
            className="filter-select"
            value={filter}
            onChange={(e) => setFilter(e.target.value)} // <-- wire up select
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="active">Đang hoạt động</option>
            <option value="inactive">Không hoạt động</option>
          </select>
        </div>
      </div>

      <div className="table-container">
        <table id="routes-table" className="routes-table">
          <thead>
            <tr>
              <th><i className="fas fa-hashtag" /> MÃ SỐ TUYẾN</th>
              <th><i className="fas fa-signature" /> TÊN TUYẾN</th>
              <th><i className="fas fa-map-marker-alt" /> TRẠM BẮT ĐẦU</th>
              <th><i className="fas fa-route" /> TỔNG ĐƯỜNG ĐI</th>
              <th><i class="fa-solid fa-person"></i> SỐ HỌC SINH</th>
              <th><i className="fas fa-clock" /> THỜI GIAN</th>
              <th><i className="fas fa-traffic-light" /> TÌNH TRẠNG</th>
              <th><i className="fas fa-info-circle" /> CHI TIẾT</th>
            </tr>
          </thead>
          <tbody id="routes-body">
                {renderRoutesTable(filteredRoutes,handleViewDetail)}
          </tbody>
        </table>
        {showDetail.key && (
          <RouteDetail
            route={showDetail.value} // ví dụ: hiển thị chi tiết của tuyến đầu tiên  
            onClose={() => setShowDetail({key:false,value:null})}
            onSave={handleSaveRoute}
            />)}
      </div>
      </>
      }
      {showaddroute && (
        <AddRoute
         onclose={cancelShowAddRoute}
        />
      )}
      
    </div>
    
  );
}

export default RouteManagementPage;