// src/pages/UserSettings.tsx
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Navigation } from "@/components/Navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BottomNav } from "@/components/BottomNav";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { User, Shield, Database, LogOut } from "lucide-react";
import { useUser } from "@/context/UserProvider";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

const UserSettings = () => {
    const { user } = useUser();
    const navigate = useNavigate();
    const token = localStorage.getItem("jwt");

    const [loading, setLoading] = useState(true);
    const [email, setEmail] = useState<string | null>(null);
    const [role, setRole] = useState<string | null>(null);
    const [nickname, setNickname] = useState("게이머");
    const [profileImg, setProfileImg] = useState<string | null>(null);

    const fileInputRef = useRef<HTMLInputElement | null>(null);

    useEffect(() => {
        if (!token) {
            navigate("/auth");
            return;
        }
        if (user) {
            setEmail(user.sub ?? "알 수 없음");
            setRole(user.role ?? "알 수 없음");
        }
        setLoading(false);
    }, [token, user]);

    const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const url = URL.createObjectURL(file);
        setProfileImg(url);
    };

    const handleSaveProfile = () => {
        alert(`프로필 저장됨: ${nickname}`);
    };

    const handleExportData = () => {
        const data = {
            email,
            role,
            nickname,
            favorites: ["오락존 PC방", "천국 PC방"],
        };
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "user-data.json";
        a.click();
    };

    const handleLogoutAll = () => {
        localStorage.removeItem("jwt");
        alert("모든 기기에서 로그아웃되었습니다.");
        navigate("/auth");
    };

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
                        <p className="text-muted-foreground">계정, 프로필, 보안 정보를 관리할 수 있습니다.</p>
                    </div>

                    {/* 프로필 관리 */}
                    <Card className="shadow-subtle hover:shadow-elegant transition-all duration-300">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <User className="w-5 h-5 text-primary" />
                                프로필 관리
                            </CardTitle>
                            <CardDescription>닉네임을 수정할 수 있습니다.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">

                            <Button className="h-11 px-5 text-sm font-semibold bg-gradient-primary shadow-elegant hover:opacity-90 transition-all"
                                size="sm"
                                onClick={handleSaveProfile}>수정</Button>
                        </CardContent>
                    </Card>

                    {/* 보안 설정 */}
                    <Card className="shadow-subtle hover:shadow-elegant transition-all duration-300">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Shield className="w-5 h-5 text-primary" />
                                보안 설정
                            </CardTitle>
                            <CardDescription>로그인 및 세션 정보를 관리합니다.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3 text-sm">
                            <p>Email: {email}</p>
                            <p>Role: {role}</p>
                            <p>마지막 로그인: 2025-11-10 16:30</p>
                            <p>세션 만료까지 남은 시간: 23분</p>
                            <Button variant="destructive" className="mt-2 flex items-center gap-2" onClick={handleLogoutAll}>
                                <LogOut className="w-4 h-4" /> 모든 기기 로그아웃
                            </Button>
                        </CardContent>
                    </Card>


                    <BottomNav />
                </div>
            </main>
        </div>
    );
};

export default UserSettings;
