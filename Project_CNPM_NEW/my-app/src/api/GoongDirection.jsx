import GoongClient from "./GoongClient";
export async function getDirection({ origin, destination, vehicle = "bike" }) {
  try {
    const res = await GoongClient.get("/Direction", {
      params: {
        api_key: process.env.REACT_APP_GOONG_API_KEY,
        origin: `${origin.lat||origin.latitude},${origin.lng||origin.longitude}`,
        destination: `${destination.lat||destination.latitude},${destination.lng||destination.longitude}`,
        vehicle,
      },
    });
    return res.data;
  } catch (err) {
    console.error("Lỗi lấy hướng dẫn:", err.response?.data || err.message);
    throw new Error("Không thể lấy dữ liệu đường đi");
  }
}

export async function createRoute({ origin, destination, vehicle = "bike" }) {
  try {
    const directionData = await getDirection({ origin, destination, vehicle });
    
    if (!directionData?.routes?.length) {
      throw new Error("Không tìm thấy đường đi");
    }
    
    const route = directionData.routes[0];
    const leg = route.legs[0];
    
    return {
      success: true,
      distance: leg.distance, // mét
      duration: leg.duration, // giây
      polyline: route.overview_polyline.points,
      legs: route.legs,
      steps: leg.steps || [],
      bounds: route.bounds // bounds để fit map
    };  
    
  } catch (error) {
    console.error("Lỗi tạo đường đi:", error.message);
    return {
      success: false,
      error: error.message
    };
  }
}