// src/pages/UserSettings.tsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Navigation } from "@/components/Navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BottomNav } from "@/components/BottomNav";
import { Crown, User } from "lucide-react";
import { useUser } from "@/context/UserProvider";
import api from "@/api/axiosInstance";

const UserSettings = () => {
  const { user } = useUser();
  const navigate = useNavigate();
  const token = localStorage.getItem("jwt");

  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState<string | null>(null);
  const [role, setRole] = useState<string | null>(null);

  const safeApiGet = async (url: string, config = {}) => {
    if (!token) return null;
    try {
      const res = await api.get(url, config);
      return res.data;
    } catch (err: any) {
      console.error(err);
      if (err.response?.status === 401) {
        localStorage.removeItem("jwt");
        navigate("/auth");
      }
      return null;
    }
  };

  useEffect(() => {
    if (!token) {
      navigate("/auth");
      return;
    }

    // Dashboard.tsx에서 이미 user 정보가 context에 있음
    // user?.sub, user?.role 값 그대로 사용
    if (user) {
      setEmail(user.sub ?? "알 수 없음");
      setRole(user.role ?? "알 수 없음");
      setLoading(false);
    } else {
      // 혹시 context가 아직 로드되지 않았을 때 대비
      safeApiGet("/favorites").finally(() => setLoading(false));
    }
  }, [token, user]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-muted-foreground">
        사용자 정보를 불러오는 중입니다...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 p-6">
      <Navigation />
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12">
        <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
          {/* Header */}
          <div>
            <h1 className="text-4xl font-bold mb-2 bg-gradient-primary bg-clip-text text-transparent">
              사용자 설정
            </h1>
            <p className="text-muted-foreground">현재 로그인된 사용자 정보를 확인합니다.</p>
          </div>

          {/* 계정 정보 카드 */}
          <Card className="shadow-subtle hover:shadow-elegant transition-all duration-300">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5 text-primary" />
                계정 정보
              </CardTitle>
              <CardDescription>로그인한 계정의 기본 정보입니다.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div>Email: {email}</div>
              <div>ROLE: {role}</div>
            </CardContent>
          </Card>

          {/* 즐겨찾기 정보 카드 */}
          <Card className="shadow-subtle hover:shadow-elegant transition-all duration-300">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Crown className="w-5 h-5 text-primary" />
                즐겨찾기 요약
              </CardTitle>
              <CardDescription>내가 등록한 PC방 정보를 확인할 수 있습니다.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-muted-foreground text-sm">
                Dashboard에서 관리 중인 즐겨찾기 목록을 참고하세요.
              </div>
            </CardContent>
          </Card>

          <BottomNav />
        </div>
      </main>
    </div>
  );
};

export default UserSettings;
