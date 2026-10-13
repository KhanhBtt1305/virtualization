import L from 'leaflet';
import stopImg from "../../assets/image/stop.png";
import busImg from "../../assets/image/vitri.png";

export const VAN_TOC = 40; // km/h ≈ 11.12 m/s
// Tạo icon cho xe và trạm
export const iconXe = L.icon({
  iconUrl: busImg,
  iconSize: [45, 55],
  iconAnchor: [27, 55],
});

export const iconTram = L.icon({
  iconUrl: stopImg,
  iconSize: [50, 60],
  iconAnchor: [12, 41],
});