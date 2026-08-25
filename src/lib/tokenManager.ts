// src/lib/tokenManager.ts

// JWT 토큰을 관리하는 유틸리티 파일입니다.
// TODO(보안): 현재는 편의상 localStorage를 사용하지만, 상용화 시에는 
// XSS 공격 방지를 위해 백엔드에서 httpOnly 쿠키로 토큰을 설정하도록 변경해야 합니다.

const TOKEN_KEY = "jwt";

export const getToken = (): string | null => {
  return localStorage.getItem(TOKEN_KEY);
};

export const setToken = (token: string): void => {
  localStorage.setItem(TOKEN_KEY, token);
};

export const clearToken = (): void => {
  localStorage.removeItem(TOKEN_KEY);
};
