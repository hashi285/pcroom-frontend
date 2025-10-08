import axios, { AxiosRequestConfig, AxiosResponse, AxiosError } from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL, // e.g. http://localhost:8080
  withCredentials: true,
});

// 요청 인터셉터: JWT 자동 추가
api.interceptors.request.use((config: any) => {
  const token = localStorage.getItem("jwt");
  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
// 응답 인터셉터: 401 처리
api.interceptors.response.use(
  (res: AxiosResponse) => res,
  (err: AxiosError) => {
    if (err.response?.status === 401) {
      localStorage.removeItem("jwt");
      window.location.href = "/auth"; // 로그인 페이지로
    }
    return Promise.reject(err);
  }
);

export default api;
