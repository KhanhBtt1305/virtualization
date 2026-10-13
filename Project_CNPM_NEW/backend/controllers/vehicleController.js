const { getStopsByRoute, getScheduleByRoute, getAllRoutesFull } = require('../models/vehicleModel');
const axios = require('axios');

// Cache tạm thời trong memory
const geocodeCache = {}; // key = address, value = {lat, lng}

/**
 * Geocode address bằng OSM Nominatim
 */
async function geocodeOSM(address) {
    if (geocodeCache[address]) return geocodeCache[address];

    try {
        const res = await axios.get('https://nominatim.openstreetmap.org/search', {
            params: { q: address, format: 'json', limit: 1 },
            headers: { 'User-Agent': 'NodeJS BusMap App' }
        });

        if (res.data && res.data.length > 0) {
            const coords = { lat: parseFloat(res.data[0].lat), lng: parseFloat(res.data[0].lon) };
            geocodeCache[address] = coords;
            return coords;
        }

        // fallback nếu OSM không trả kết quả
        return { lat: 0, lng: 0 };
    } catch (err) {
        console.error('OSM Geocoding error:', err.message);
        return { lat: 0, lng: 0 };
    }
}

/**
 * API: Lấy tuyến theo route_id
 */
async function getRoute(req, res) {
    const { route_id } = req.params;

    try {
        const stops = await getStopsByRoute(route_id);
        const schedule = await getScheduleByRoute(route_id);

        // Geocode tất cả stops cùng lúc
        const geocodedStops = await Promise.all(
            stops.map(async stop => {
                const coords = await geocodeOSM(stop.address);
                return { ...stop, lat: coords.lat, lng: coords.lng };
            })
        );

        res.json({ stops: geocodedStops, schedule });
    } catch (err) {
        console.error('Error in getRoute:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

/**
 * API: Lấy tất cả tuyến + stops + schedule
 */
async function getAllRoutes(req, res) {
    try {
        const routes = await getAllRoutesFull();

        // Geocode stops của tất cả tuyến cùng lúc
        const geocodedRoutes = await Promise.all(
            routes.map(async route => {
                const stops = await Promise.all(
                    route.stops.map(async stop => {
                        const coords = await geocodeOSM(stop.address);
                        return { ...stop, lat: coords.lat, lng: coords.lng };
                    })
                );
                return { ...route, stops };
            })
        );

        res.json(geocodedRoutes);
    } catch (err) {
        console.error('Error in getAllRoutes:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

module.exports = { getRoute, getAllRoutes };
