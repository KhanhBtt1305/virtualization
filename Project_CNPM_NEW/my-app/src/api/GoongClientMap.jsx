// src/api/goongClient.js
import axios from "axios";

const GOONG_API_KEY = process.env.REACT_APP_GOONG_API_MAPTILE_KEY;

const goongClientMap = axios.create({
  baseURL: "https://rsapi.goong.io",
  params: { api_key: GOONG_API_KEY },
  timeout: 5000,
});

export default goongClientMap;
