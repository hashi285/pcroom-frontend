import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL, // 백엔드 주소
  withCredentials: true, // 쿠키 인증 사용하는 경우 필수
});

// 응답 인터셉터
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // 인증 에러 처리
      if (error.response.status === 401 || error.response.status === 403) {
        // 로그인 페이지로 이동
        window.location.href = "/auth";
      }
    }
    return Promise.reject(error);
  }
);

export default api;
