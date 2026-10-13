import { Marker, Popup } from "@goongmaps/goong-map-react";
import { useState, useEffect } from "react";
import "./PointLocation.css";

function PointLocation({ 
  location, 
  styleView = {},
  styleLocation = { color: "green", style: <i className="fa-solid fa-location-dot"></i> }
}) {
  const [styleViewState, setStyleViewState] = useState({
    offsetLeft: -15,
    offsetTop: -40,
    colorLocation: 'red',
    fontSize: '1.5em',
  });

  const [selectedPoint, setSelectedPoint] = useState(null);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    if (styleView) {
      setStyleViewState(prev => ({
        ...prev,
        ...styleView
      }));
    }
  }, [styleView]);

  return (
    <>
      <Marker
        latitude={location.lat||location.latitude}
        longitude={location.lng||location.longitude}
        offsetLeft={styleViewState.offsetLeft}
        offsetTop={styleViewState.offsetTop}
      >
        <div
          className="point-marker-container"
          onClick={() => setSelectedPoint({ ...location, name: location.name||location.stop_name })}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {/* Outer circle with pulse effect */}
          <div className="marker-pulse"></div>
          
          {/* Main marker pin */}
          <div 
            className={`marker-pin ${isHovered ? 'hovered' : ''}`}
            style={{ 
              color: styleLocation.color || 'red',
              fontSize: styleViewState.fontSize,
            }}
          >
            {styleLocation.style || <i className="fa-solid fa-location-dot"></i>}
          </div>

          {/* Optional: shadow effect */}
          <div className="marker-shadow"></div>
        </div>
      </Marker>

      {selectedPoint && (
        <Popup
          latitude={selectedPoint.lat||selectedPoint.latitude}
          longitude={selectedPoint.lng||selectedPoint.longitude}
          onClose={() => setSelectedPoint(null)}
          anchor="bottom"
          closeButton={true}
          closeOnClick={false}
        >
          <div className="popup-content">
            <h3 className="popup-title">{selectedPoint.name||selectedPoint.stop_name}</h3>
            <p className="popup-coords">
              {(selectedPoint.lat||selectedPoint.latitude).toFixed(4)}, {(selectedPoint.lng||selectedPoint.longitude).toFixed(4)}
            </p>
          </div>
        </Popup>
      )}
    </>
  );
}

export default PointLocation;