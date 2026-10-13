// vehicleModel.js
const pool = require('../db');

// Lấy stop theo route_id
async function getStopsByRoute(route_id) {
  const [rows] = await pool.query(
    `SELECT stop_id, stop_name, address, stop_order
     FROM bus_stop
     WHERE route_id = ?
     ORDER BY stop_order`,
    [route_id]
  );
  return rows;
}

// Lấy lịch trình theo route_id
async function getScheduleByRoute(route_id) {
  const [rows] = await pool.query(
    `SELECT schedule_id, route_id, bus_id, driver_id, schedule_date, start_time
     FROM bus_schedule
     WHERE route_id = ?`,
    [route_id]
  );
  return rows;
}

// Lấy tất cả tuyến + stops + schedule
async function getAllRoutesFull() {
  const [routes] = await pool.query("SELECT * FROM route");
  
  const result = await Promise.all(
    routes.map(async route => {
      const stops = await getStopsByRoute(route.route_id);
      const schedule = await getScheduleByRoute(route.route_id);
      return { ...route, stops, schedule };
    })
  );

  return result;
}

module.exports = {
  getStopsByRoute,
  getScheduleByRoute,
  getAllRoutesFull,
};
