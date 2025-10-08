import { createContext, useContext, ReactNode, useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode"; // ← 이렇게 import

interface JwtPayload {
  userId: number;
  sub: string;
  role: "USER" | "ADMIN";
}

interface UserContextType {
  user: JwtPayload | null;
  setUser: (user: JwtPayload | null) => void;
}

const UserContext = createContext<UserContextType>({
  user: null,
  setUser: () => {},
});

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<JwtPayload | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("jwt");
    if (token) {
      try {
        const decoded = jwtDecode<JwtPayload>(token); // 타입 안전하게 디코딩
        setUser(decoded);
      } catch (err) {
        console.error("JWT 디코딩 실패:", err);
        setUser(null);
      }
    }
  }, []);

  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
