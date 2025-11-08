// src/api/axiosInstance.ts
import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8080/api", // 백엔드 주소  https://pcroom.duckdns.org/api
});

// 요청 시 자동 JWT 헤더 추가
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("jwt");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// 응답 실패 시 자동 처리
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401, 403) {
      localStorage.removeItem("jwt");
      window.location.href = "/auth"; // SPA redirect
    }
    return Promise.reject(err);
  }
);

export default api;
