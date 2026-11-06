import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { InteractiveMap } from '@goongmaps/goong-map-react';
import 'mapbox-gl/dist/mapbox-gl.css';
import PointLocation from './MapHandle/PointLocation';
import DrawRoute from './MapHandle/DrawRoute';

const GOONG_MAPTILES_KEY = process.env.REACT_APP_GOONG_API_MAPTILE_KEY;

const symbolLocation = <i className="fa-solid fa-location-dot"></i>;
const styleLocation = {
  temp: { color: 'black', style: "📍" },
  pointtraim: { color: "red", style: symbolLocation },
  pointcurrent: { color: "blue", style: symbolLocation },
  pointstart: { color: "green", style: symbolLocation },
  pointend: { color: "black", style: symbolLocation },
};

const styleZoomInOut = {
  color: "black",
  fontSize: "1.4em",
  width: 44,
  height: 36,
  borderRadius: 4,
  border: 'none',
  background: '#fff',
  boxShadow: '0 1px 4px rgba(0,0,0,.2)',
  cursor: 'pointer',
  justifyContent: "center",
  alignItems: "center",
  display: "flex",
};

// Helper: validate coordinate object
const isValidCoord = (coord) => {
  if (!coord) return false;
  const lat = coord.lat ?? coord.latitude;
  const lng = coord.lng ?? coord.longitude;
  return typeof lat === 'number' && !isNaN(lat) &&
         typeof lng === 'number' && !isNaN(lng);
};

// Helper: normalize coord to {lat, lng}
const normalizeCoord = (coord) => ({
  lat: coord.lat ?? coord.latitude,
  lng: coord.lng ?? coord.longitude,
  ...coord
});

const MapComponent = ({ positionCurrent = { start: null, end: null }, stops = [] }) => {
  const [viewport, setViewport] = useState({
    latitude: 10.7500452,
    longitude: 106.6622499,
    zoom: 15,
    width: '100%',
    height: '100%',
    bearing: 0,
    pitch: 0,
    transitionDuration: 1000
  });

  const [chooseMapLocation, setChooseMapLocation] = useState(null);
  const [userLocation, setUserLocation] = useState(null);

  // Validate + normalize stops
  const validStops = useMemo(() => {
    return stops.filter(isValidCoord).map(normalizeCoord);
  }, [stops]);

  const startLatitude = positionCurrent.start?.lat;
  const startLongitude = positionCurrent.start?.lng;
  const endLatitude = positionCurrent.end?.lat;
  const endLongitude = positionCurrent.end?.lng;
  const lastStop = validStops[validStops.length - 1];
  const lastStopLatitude = lastStop?.lat;
  const lastStopLongitude = lastStop?.lng;

  // Update viewport khi start/end thay đổi
  useEffect(() => {
    if (isValidCoord(positionCurrent.start)) {
      setViewport(prev => ({
        ...prev,
        latitude: positionCurrent.start.lat,
        longitude: positionCurrent.start.lng,
        zoom: Math.max(prev.zoom, 15)
      }));
    }
  }, [positionCurrent.start, startLatitude, startLongitude]);
  useEffect(()=>{
    if (isValidCoord(positionCurrent.end)) {
      setViewport(prev => ({
        ...prev,
        latitude: positionCurrent.end.lat,
        longitude: positionCurrent.end.lng,
        zoom: Math.max(prev.zoom, 15)
      }));
    }
  }, [positionCurrent.end, endLatitude, endLongitude]);
  // Update viewport khi last stop thay đổi
  useEffect(() => {
    if (isValidCoord(lastStop)) {
      setViewport(prev => ({
        ...prev,
        latitude: lastStop.lat,
        longitude: lastStop.lng,
        zoom: Math.max(prev.zoom, 16)
      }));
    }
  }, [lastStop, lastStopLatitude, lastStopLongitude]);

  const handleMapChoose = useCallback((event) => {
    if (!event?.lngLat) return;
    const [lng, lat] = Array.isArray(event.lngLat) ? event.lngLat : [event.lngLat.lng, event.lngLat.lat];
    
    if (typeof lat === 'number' && typeof lng === 'number' && !isNaN(lat) && !isNaN(lng)) {
      setChooseMapLocation({ lat, lng, name: 'Vị trí đã chọn' });
    }
  }, []);

  const zoomIn = useCallback(() => {
    setViewport(prev => ({ ...prev, zoom: Math.min((prev.zoom || 0) + 1, 22) }));
  }, []);

  const zoomOut = useCallback(() => {
    setViewport(prev => ({ ...prev, zoom: Math.max((prev.zoom || 0) - 1, 0) }));
  }, []);

  const locateMe = useCallback(() => {
    if (!navigator.geolocation) {
      alert('Trình duyệt không hỗ trợ Geolocation.');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        const loc = { lat: latitude, lng: longitude };
        setUserLocation(loc);
        setViewport(prev => ({
          ...prev,
          latitude,
          longitude,
          zoom: Math.max(prev.zoom || 0, 15)
        }));
      },
      (err) => {
        console.error('Geolocation error', err);
        alert('Không thể lấy vị trí');
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  }, []);

  const handleViewportChange = useCallback((vp) => {
    setViewport(prev => ({ ...prev, ...vp }));
  }, []);

  const currentFont = "1.5em";

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      {/* Controls */}
      <div style={{
        position: 'absolute',
        right: 10,
        top: 10,
        zIndex: 10,
        display: 'flex',
        flexDirection: 'column',
        gap: 6
      }}>
        <button aria-label="Locate me" onClick={locateMe} style={styleZoomInOut}>
          <i className="fa-solid fa-location-dot"></i>
        </button>
        <button aria-label="Zoom in" onClick={zoomIn} style={styleZoomInOut}>+</button>
        <button aria-label="Zoom out" onClick={zoomOut} style={styleZoomInOut}>−</button>
      </div>

      <InteractiveMap
        {...viewport}
        goongApiAccessToken={GOONG_MAPTILES_KEY}
        onViewportChange={handleViewportChange}
        height="100%"
        width="100%"
        onClick={handleMapChoose}
      >
        

        

        {/* Stop markers */}
        {validStops.map((stop, idx) => (
          <PointLocation
            key={`stop-${idx}`}
            location={stop}
            styleView={{ colorLocation: 'yellow', fontSize: currentFont }}
            styleLocation={styleLocation.pointtraim}
          />
          
        ))}
        {validStops.length >4 &&(
          
          <>
          <DrawRoute origin={validStops[0]} destination={validStops[1]}/>
          <DrawRoute origin={validStops[2]} destination={validStops[3]}/>
          </>
        )
        }
        {/* Start/End markers */}
        {isValidCoord(positionCurrent.start) && (
          <PointLocation
            location={{ ...positionCurrent.start, name: 'Điểm bắt đầu' }}
            styleView={{ colorLocation: 'green', fontSize: currentFont }}
            styleLocation={styleLocation.pointstart}
          />
        )}
        {isValidCoord(positionCurrent.end) && (
          <PointLocation
            location={{ ...positionCurrent.end, name: 'Điểm kết thúc' }}
            styleView={{ colorLocation: 'black', fontSize: currentFont }}
            styleLocation={styleLocation.pointend}
          />
        )}

        {/* User location marker */}
        {userLocation && (
          <PointLocation
            location={{ ...userLocation, name: 'Vị trí của bạn' }}
            styleView={{ colorLocation: 'blue', fontSize: currentFont }}
            styleLocation={styleLocation.pointcurrent}
          />
        )}

        {/* Clicked location marker */}
        {chooseMapLocation && (
          <PointLocation
            location={chooseMapLocation}
            styleView={{ colorLocation: 'green', fontSize: currentFont }}
            styleLocation={styleLocation.temp}
          />
        )}
      </InteractiveMap>
    </div>
  );
};

export default MapComponent;