// src/api/axiosInstance.ts
import axios from "axios";
import { getToken, clearToken } from "@/lib/tokenManager";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8080/api",
});

// 요청 시 자동 JWT 헤더 추가
api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// 응답 실패 시 자동 처리
api.interceptors.response.use(
  (res) => res,
  (err) => {
    const status = err.response?.status;

    if (status === 401 || status === 403) {
      clearToken();
      // 강제 리로드 대신 이벤트를 발생시켜 UserProvider에서 부드럽게 라우팅 처리
      window.dispatchEvent(new Event("unauthorized"));
    }

    return Promise.reject(err);
  }
);

export default api;
