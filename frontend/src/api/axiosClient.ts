import axios from "axios";

const axiosClient = axios.create({
  baseURL: "https://ript1307-01-2026-nhom1-kthp.onrender.com/api",
  headers: {
    "Content-Type": "application/json"
  }
});

axiosClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default axiosClient;
