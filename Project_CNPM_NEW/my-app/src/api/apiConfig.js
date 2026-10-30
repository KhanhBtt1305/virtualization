const API_BASE_URL = (
  process.env.REACT_APP_API_URL || "https://virtualization-pi.vercel.app/api"
).replace(/\/+$/, "");

export const apiUrl = (path = "") =>
  `${API_BASE_URL}/${path.replace(/^\/+/, "")}`;

export default API_BASE_URL;
