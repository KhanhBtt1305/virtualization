// src/api/client.js
import axios from "axios";

const API_BASE = "http://localhost:5000/api";

// Tạo instance axios chung
const api = axios.create({
  baseURL: API_BASE,
  withCredentials: true,
});

export default api;
