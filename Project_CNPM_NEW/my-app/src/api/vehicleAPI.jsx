import axiosClient from "./AxiosClient";

const vehicleAPI = {
  getAllRoutes: () => axiosClient.get("/vehicle/routes"),
  getRoute: (td_id) => axiosClient.get(`/vehicle/route/${td_id}`),
};

export default vehicleAPI;
