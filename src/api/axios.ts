import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL, // 백엔드 주소
  withCredentials: true, // 쿠키 인증 사용하는 경우 필수
});



export default api;
