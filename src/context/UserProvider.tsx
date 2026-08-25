import { createContext, useContext, ReactNode, useState, useEffect, useCallback } from "react";
import { jwtDecode } from "jwt-decode";
import { useNavigate } from "react-router-dom";
import { getToken, setToken, clearToken } from "@/lib/tokenManager";

interface JwtPayload {
  userId: number;
  sub: string;
  role: "USER" | "ADMIN" | "OWNER";
}

interface UserContextType {
  user: JwtPayload | null;
  login: (token: string) => void;
  logout: () => void;
}

const UserContext = createContext<UserContextType>({
  user: null,
  login: () => {},
  logout: () => {},
});

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<JwtPayload | null>(null);
  const navigate = useNavigate();

  const handleSetUser = useCallback((token: string) => {
    try {
      const decoded = jwtDecode<JwtPayload>(token);
      setUser(decoded);
    } catch (err) {
      console.error("JWT 디코딩 실패:", err);
      setUser(null);
      clearToken();
    }
  }, []);

  const login = useCallback((token: string) => {
    setToken(token);
    handleSetUser(token);
  }, [handleSetUser]);

  const logout = useCallback(() => {
    clearToken();
    setUser(null);
    navigate("/auth", { replace: true });
  }, [navigate]);

  useEffect(() => {
    const token = getToken();
    if (token) {
      handleSetUser(token);
    }

    // axios interceptor에서 발생한 unauthorized 이벤트 리스닝
    const handleUnauthorized = () => {
      logout();
    };

    window.addEventListener("unauthorized", handleUnauthorized);
    return () => {
      window.removeEventListener("unauthorized", handleUnauthorized);
    };
  }, [handleSetUser, logout]);

  return (
    <UserContext.Provider value={{ user, login, logout }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
