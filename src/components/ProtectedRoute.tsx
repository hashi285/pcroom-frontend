import { Navigate } from "react-router-dom";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  // JWT 가져오기
  const token = localStorage.getItem("jwt");

  // 로딩 표시 없이 바로 판단
  if (!token) {
    // 토큰 없으면 로그인 페이지로 리다이렉트
    return <Navigate to="/auth" replace />;
  }

  // 토큰 있으면 자식 컴포넌트 렌더
  return <>{children}</>;
};
