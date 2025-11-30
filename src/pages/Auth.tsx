// src/pages/Auth.tsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import api from "@/api/axiosInstance";

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nickname, setNickname] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { toast } = useToast();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 로그인 시 기존 JWT 초기화
      localStorage.removeItem("jwt");

      if (isLogin) {
        const res = await api.post("/login", { email, password });
        const { token, role } = res.data;
        

        // 새 토큰 저장
        localStorage.setItem("jwt", token);

        if (role === "ADMIN") navigate("/manager-dashboard");
        else navigate("/dashboard");
        
      } else {
        // 회원가입 시 처리
        await api.post("/signup", { email, password, nickname });

        setIsLogin(true); // 회원가입 후 로그인 화면으로
      }
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.response?.data || err.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5 p-4">
      <Card className="w-full max-w-md shadow-elegant">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            피방자리
          </CardTitle>
          <CardDescription>
            로그인 또는 회원가입하여 시작하세요..
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAuth} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">이메일</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">비밀번호</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {!isLogin && (
              <div className="space-y-2">
                <Label htmlFor="nickname">닉네임</Label>
                <Input
                  id="nickname"
                  type="text"
                  placeholder="피방자리유저"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  required
                />
              </div>
            )}

            <Button type="submit" className="w-full bg-gradient-primary shadow-elegant" disabled={loading}>
              {loading ? "Loading..." : isLogin ? "로그인" : "회원가입"}
            </Button>
          </form>

          <div className="mt-4 text-center text-sm">
            <button type="button" onClick={() => setIsLogin(!isLogin)} className="text-primary hover:underline">
              {isLogin ? "계정이 없으신가요? 회원가입 하세요!" : "계정으로 로그인하세요!"}
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;
