import { useCallback, useEffect, useState } from "react";
import { createRoute } from "../../api/GoongDirection";
import { Source,Layer } from "@goongmaps/goong-map-react";
function DrawRoute({origin,destination,setViewport=()=>{},styleDrawView={}}){
    // Layer style cho route
    
  const routeLayer = {
    id: 'route',
    type: 'line',
    layout: {
      'line-join': 'round',
      'line-cap': 'round'
    },
    paint: {
      'line-color': '#3887be',
      'line-width': 5,
      'line-opacity': 0.75
    }
  };
    const [routeData,setRouteData] = useState(null)
    const decodePolyline = (str, precision = 5) => {
      
  let index = 0,
    lat = 0,
    lng = 0,
    coordinates = [],
    shift = 0,
    result = 0,
    byte = null,
    latitude_change,
    longitude_change,
    factor = Math.pow(10, precision || 5);

  while (index < str.length) {
    byte = null;
    shift = 0;
    result = 0;

    do {
      byte = str.charCodeAt(index++) - 63;
      result |= (byte & 0x1f) << shift;
      shift += 5;
    } while (byte >= 0x20);

    latitude_change = result & 1 ? ~(result >> 1) : result >> 1;

    shift = result = 0;

    do {
      byte = str.charCodeAt(index++) - 63;
      result |= (byte & 0x1f) << shift;
      shift += 5;
    } while (byte >= 0x20);

    longitude_change = result & 1 ? ~(result >> 1) : result >> 1;

    lat += latitude_change;
    lng += longitude_change;

    coordinates.push([lng / factor, lat / factor]);
  }

  return coordinates;
};
const fetchDirection = useCallback(async()=> {
      
      try {
        const data = await createRoute({
          origin: origin,        // TP.HCM
          destination: destination,  // Quận 1
          vehicle: "bike",
        });
        const coordinates = decodePolyline(data.polyline)
// Tạo GeoJSON cho route
        const routeGeoJSON = {
          type: 'Feature',
          geometry: {
            type: 'LineString',
            coordinates: coordinates
          },
          properties: {}
        };
        setRouteData(routeGeoJSON)
        // Fit map to route bounds (nếu có bounds từ API)
        
        if (data.success)
      console.log("Đường đi:", data);
      // Xử lý kết quả ở đây (vẽ lên bản đồ, hiển thị thông tin, etc.)
    
      } catch (error) {
        console.error("Lỗi lấy hướng dẫn:", error);
      }},[origin,destination])
    useEffect (()=>{
      fetchDirection()
    },[fetchDirection])
        
    return (
        <>
          {routeData && (
          <Source id={routeData.stop_code} type="geojson" data={routeData}>
            <Layer {...routeLayer} />
          </Source>
        )}
        </>
    );
}
export default DrawRoute