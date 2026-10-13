// src/api/goongClient.js
import axios from "axios";
import { useEffect } from "react";

const GOONG_API_KEY = process.env.REACT_APP_GOONG_API_KEY;

  const goongClient = axios.create({
  baseURL: "https://rsapi.goong.io",
  params: { api_key: GOONG_API_KEY },
  timeout: 5000,
});
  

export default goongClient;