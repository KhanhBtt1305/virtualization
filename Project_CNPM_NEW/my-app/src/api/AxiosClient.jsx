// src/api/client.js
import axios from "axios";
import API_BASE_URL from "./apiConfig";

// Tạo instance axios chung
const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

export default api;
