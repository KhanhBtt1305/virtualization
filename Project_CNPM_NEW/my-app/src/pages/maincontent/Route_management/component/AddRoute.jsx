// ...existing code...
import React, { useRef, useEffect, useState } from 'react';
import './addRoute.css';

import StyleMain from "./../../styleMain.module.css";
import MapComponent from "./../../../../components/MapComponent"
import SearchSuggestAddress from '../../../../components/MapHandle/SearchSuggestAddress';
import {Stop,stops} from '../../../../models/Stop';
function listtoString(list){
  let stopNames = "";

 list.forEach(temp => {
  stopNames += temp.stop_name + "->";
});
return stopNames.slice(0, -2); // loại bỏ dấu phẩy và khoảng trắng cuối cùng
}
function AddRoute({onclose=()=>{}}) {
  const [stations,setStation]= useState([]);
  useEffect(()=>{
    // giả lập lấy danh sách trạm từ API
    setStation(stops);
  }
    
    ,[])
  const [positions,setPosition] = useState({
    start: null,
    end: null
  })
  const handleStartLocation = (geometry)=>{
    
    if(geometry){
      setPosition(pos=>({...pos,start:geometry}))
    }
    
  }
  const handleEndLocation = (geometry)=>{
    
    if(geometry){
      setPosition(pos=>({...pos,end:geometry}))
    }
  }
  const [startAddress, setStartAddress] = useState('');
  const [endAddress, setEndAddress] = useState('');
  const [routeName, setRouteName] = useState('');
  const [selectedStations, setSelectedStations] = useState(new Set());
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');

  const toggleStation = (name) => {

    setSelectedStations(prev => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  };

  const handleSave = (e) => {
    e.preventDefault();
    const payload = {
      routeName: routeName || `${startAddress} → ${endAddress}`,
      startAddress, endAddress,
      stations: Array.from(selectedStations),
      startTime, endTime
    };
    // TODO: gọi API lưu tuyến ở đây
    console.log('Save route', payload);
    alert('Đã lưu tuyến (console.log)');
  };

  const selectedList = Array.from(selectedStations)
  const routeDisplay = routeName || "";
  const mapRel = useRef(null);
  useEffect(()=>{
    if(!mapRel.current){
      mapRel.current = <MapComponent positionCurrent={positions} stops={[...selectedStations]}/>
    }
  },[positions,selectedStations])
  return (
    <div className="add-route-wrap" >
      <header className="add-route-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1>Chọn / Tạo tuyến đường</h1>
          <button 
            className="btn-close-route" 
            onClick={()=>onclose()}
            style={{ 
              background: '#ef4444', 
              color: '#fff', 
              border: 'none', 
              padding: '8px 12px',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '14px'
            }}
          >
            ✕ Đóng
          </button>
        </div>
        <form className="search-row" onSubmit={(e) => e.preventDefault()}>
          <SearchSuggestAddress placeholderinput="nhập địa chỉ bắt đầu" className="search-input"  onAddressSelect={handleStartLocation}/>
          <SearchSuggestAddress placeholderinput="nhập địa chỉ kết thúc" className="search-input" onAddressSelect={handleEndLocation}/>
          <button className="search-address-btn" type="button" onClick={() => console.log(positions)}>
            Tìm tuyến
          </button>
        </form>
      </header>

      <div className="add-route-main">
        <section className="left-card">
          <form className="form-card" onSubmit={handleSave} style={{width:"auto"}}>
            <h2 className="section-title">Tạo Tuyến xe mới</h2>
            <button>+Thêm trạm</button>
            <button>🗑️Xóa trạm</button>
              <input
                className="text-input"
                type="text"
                placeholder="Nhập tên tuyến (VD: Suối Tiên - Bến Thành)"
                value={routeName}
                onChange={e => setRouteName(e.target.value)}
              />

            <div className="divider" />

            <h3 className="sub-title">Các trạm đi qua</h3>
            <div className="stations-list">
              {stations.map((s, idx) => {
                const id = `station-${idx}`;
                return (
                  <label htmlFor={id} className={`station-item ${selectedStations.has(s) ? 'active' : ''}`}>
                    <input
                      id={id}
                      type="checkbox"
                      checked={selectedStations.has(s)}
                      onChange={() => toggleStation(s)}
                    />
                    <span className="station-name">{s.stop_name}</span>
                  </label>
                );
              })}

              
            </div>

            <div className="divider" />

            <h3 className="sub-title">Thời gian hoạt động</h3>
            <div className="time-row">
              <input
                className="time-input"
                type="time"
                value={startTime}
                onChange={e => setStartTime(e.target.value)}
                aria-label="Bắt đầu"
              />
              <input
                className="time-input"
                type="time"
                value={endTime}
                onChange={e => setEndTime(e.target.value)}
                aria-label="Kết thúc"
              />
            </div>

            <div className="route-preview">
              <strong>Tuyến:{routeDisplay}</strong>
              
              <div className="stations-preview">
                {selectedList.length ? listtoString(selectedList): <span className="muted">Chưa chọn trạm</span>}
              </div>
            </div>

            <div className="form-actions-add-route">
              <button type="submit" className="save-btn">Lưu Tuyến xe</button>
              <button type="button" className="cancel-btn" onClick={() => {
                setRouteName(''); setStartAddress(''); setEndAddress(''); setSelectedStations(new Set()); setStartTime(''); setEndTime('');
              }}>Hủy</button>
            </div>
          </form>
        </section>

        <aside className="right-card" style={{height:"auto"}}>
          <div className="map-card" style={{height:"100%" ,width:"100%"}} >
            {/* Nếu có component map sẵn thì thay placeholder bằng MapComponent */}
            <MapComponent positionCurrent={positions} stops={[...selectedStations]}/>
          </div>
        </aside>
      </div>
    </div>
  );
}

export default AddRoute;
// ...existing code...