// src/pages/Dashboard.tsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Navigation } from "@/components/Navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, Calendar, Crown } from "lucide-react";
import { useUser } from "@/context/UserProvider";
import api from "@/api/axiosInstance";
import { BottomNav } from "@/components/BottomNav";

interface Favorite {
  pcroomId: number;
  nameOfPcroom: string;
  utilization?: number;
}

interface Pcroom {
  pcroomId: number;
  nameOfPcroom: string;
  utilization?: number;
}

const Dashboard = () => {
  const { user } = useUser();
  const navigate = useNavigate();

  const [pcrooms, setPcrooms] = useState<Pcroom[]>([]);
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("jwt");

  useEffect(() => {
    if (!token) {
      navigate("/auth");
      return;
    }

  }, [token, user, navigate]);

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

  const fetchPcrooms = async () => {
    const data = await safeApiGet("/pcrooms");
    if (Array.isArray(data)) setPcrooms(data);
    else if (data?.pcrooms && Array.isArray(data.pcrooms)) setPcrooms(data.pcrooms);
    else setPcrooms([]);
  };

  const fetchFavorites = async () => {
    setLoading(true);
    const data = await safeApiGet("/favorites");
    if (Array.isArray(data)) {
      const favoritesWithUtil = await Promise.all(
        data.map(async (fav: Favorite) => {
          const utilRes = await safeApiGet(`/pcrooms/${fav.pcroomId}/utilization`);
          return { ...fav, utilization: utilRes?.utilization ?? 0 };
        })
      );
      setFavorites(favoritesWithUtil.sort((a, b) => b.pcroomId - a.pcroomId));
    } else {
      setFavorites([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (token) {
      fetchPcrooms();
      fetchFavorites();
    }
  }, [token]);

  const handleSearch = async () => {
    const data = await safeApiGet("/pcrooms", { params: { name: search } });
    if (Array.isArray(data)) setPcrooms(data);
    else if (data?.pcrooms && Array.isArray(data.pcrooms)) setPcrooms(data.pcrooms);
    else setPcrooms([]);
  };

  const addFavorite = async (pcroomId: number) => {
    try {
      await api.post(`/favorites/${pcroomId}`);
      fetchFavorites();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 p-6">
      <Navigation />
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12">
        <div className="max-w-5xl mx-auto animate-fade-in">

          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2 bg-gradient-primary bg-clip-text text-transparent">
              대시보드
            </h1>
          </div>

          {/* 계정 정보 */}
          <div className="grid gap-6 md:grid-cols-2 mb-8">
            {/* <Card className="shadow-subtle hover:shadow-elegant transition-all duration-300">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Crown className="w-5 h-5 text-primary" />
                  계정 정보
                </CardTitle>
                <CardDescription>로그인한 사용자 계정 정보</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div>Email: {user?.sub ?? "Loading..."}</div>
                  <div>ROLE: {user?.role ?? "Loading..."}</div>
                </div>
              </CardContent>
            </Card> */}

            {/* <Card className="shadow-subtle hover:shadow-elegant transition-all duration-300">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="w-5 h-5 text-primary" />
                  공지사항
                </CardTitle>
                <CardDescription>최신 공지사항 안내</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <span className="font-medium">06-15:</span>
                    <div>공지사항이 등록되었습니다.</div>
                  </div>
                  {user?.userId && (
                    <div className="flex items-center gap-2 text-sm">
                      <span className="font-medium">첫 공지사항이 등록됩니다.</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card> */}
          </div>



          <Card className="shadow-subtle bg-gradient-card border-primary/20">
            <CardHeader>
              <CardTitle>My Favorites</CardTitle>
              <CardDescription>PC방 즐겨찾기 목록 (최신 추가순)</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center text-muted-foreground">Loading...</div>
              ) : favorites.length === 0 ? (
                <div className="text-center text-muted-foreground">No favorites yet</div>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {favorites.map((fav) => {
                    const utilization = fav.utilization ?? 0;

                    // 가동률 색상 구분
                    let colorClass = "text-slate-500 bg-slate-100";
                    if (utilization >= 80) colorClass = "text-red-500 bg-red-500/10";
                    else if (utilization >= 60) colorClass = "text-orange-500 bg-orange-500/10";
                    else if (utilization >= 40) colorClass = "text-yellow-500 bg-yellow-500/10";
                    else if (utilization > 0) colorClass = "text-green-500 bg-green-500/10";

                    return (

                      <Card
                        key={fav.pcroomId}
                        className="p-4 shadow-subtle hover:shadow-elegant transition-all duration-300 border border-border cursor-pointer"
                      >
                        <div className="flex items-center justify-between gap-4">
                          {/* 왼쪽 영역: 가동률 + 정보 */}
                          <div className="flex items-center gap-4 flex-1">
                            {/* 가동률 원형 */}
                            <div
                              className={`flex items-center justify-center h-12 w-12 rounded-full ${colorClass}`}
                            >
                              <div className="flex items-baseline gap-0.5">
                                <span className="text-lg font-bold">{utilization.toFixed(0)}</span>
                                <span className="text-xs font-medium">%</span>
                              </div>
                            </div>

                            {/* 이름 + 좌석/거리 */}
                            <div className="flex-1 flex flex-col gap-1">
                              <p className="font-semibold text-lg text-slate-900 dark:text-white">
                                {fav.nameOfPcroom}
                              </p>
                              <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                                <span>12/240석</span>
                              </div>
                            </div>
                          </div>

                          {/* 오른쪽 화살표 */}
                          <span
                            className="material-symbols-outlined text-slate-400 dark:text-slate-500"
                            onClick={() => navigate(`/pcroom/${fav.pcroomId}`)}
                          >
                            chevron_right
                          </span>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>


          <BottomNav />
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
