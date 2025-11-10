// src/pages/Dashboard.tsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Navigation } from "@/components/Navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, Calendar } from "lucide-react";
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <Navigation />
      <main className="container mx-auto px-3 sm:px-4 pt-24 pb-20">
        <div className="max-w-2xl mx-auto animate-fade-in">

          {/* Header */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              대시보드
            </h1>
          </div>

          {/* 즐겨찾기 카드 */}
          <Card className="shadow-subtle bg-gradient-card border-primary/20 rounded-xl w-full">
            <CardHeader>
              <CardTitle>My Favorites</CardTitle>
              <CardDescription>PC방 즐겨찾기 목록 (최신 추가순)</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center text-muted-foreground py-4">Loading...</div>
              ) : favorites.length === 0 ? (
                <div className="text-center text-muted-foreground py-4">No favorites yet</div>
              ) : (
                <div className="grid gap-3">
                  {favorites.map((fav) => {
                    const utilization = fav.utilization ?? 0;

                    let colorClass = "text-slate-500 bg-slate-100";
                    if (utilization >= 80) colorClass = "text-red-500 bg-red-500/10";
                    else if (utilization >= 60) colorClass = "text-orange-500 bg-orange-500/10";
                    else if (utilization >= 40) colorClass = "text-yellow-500 bg-yellow-500/10";
                    else if (utilization > 0) colorClass = "text-green-500 bg-green-500/10";

                    return (
                      <Card
                        key={fav.pcroomId}
                        className="p-4 shadow-sm hover:shadow-md transition-all duration-300 border border-border cursor-pointer rounded-lg"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-3 flex-1">
                            <div
                              className={`flex items-center justify-center h-10 w-10 rounded-full ${colorClass}`}
                            >
                              <div className="flex items-baseline gap-0.5">
                                <span className="text-base font-bold">{utilization.toFixed(0)}</span>
                                <span className="text-xs font-medium">%</span>
                              </div>
                            </div>

                            <div className="flex-1 flex flex-col">
                              <p className="font-semibold text-base text-slate-900 dark:text-white truncate">
                                {fav.nameOfPcroom}
                              </p>
                              <span className="text-sm text-slate-500 dark:text-slate-400">
                                12/240석
                              </span>
                            </div>
                          </div>

                          <span
                            className="material-symbols-outlined text-slate-400 dark:text-slate-500 text-2xl"
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

          {/* 공지사항 카드 */}
          <div className="mt-8">
            <Card className="shadow-subtle bg-gradient-card border-primary/20 rounded-xl w-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="w-5 h-5 text-primary" />
                  공지사항
                </CardTitle>
                <CardDescription>최신 공지사항 안내</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <span className="font-medium">06-15:</span>
                    <div>공지사항이 등록되었습니다.</div>
                  </div>
                  {user?.userId && (
                    <div className="flex items-center gap-2">
                      <span className="font-medium">첫 공지사항이 등록됩니다.</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

           <div className="mt-8">
            <Card className="shadow-subtle bg-gradient-card border-primary/20 rounded-xl w-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="w-5 h-5 text-primary" />
                  업데이트 소식
                </CardTitle>
                <CardDescription>2025.11.11 ~ 2026.04.31</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                  
                    <div>응애</div>
                  </div>
                  {user?.userId && (
                    <div className="flex items-center gap-2">
                      <span className="font-medium">업데이트 한다</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          <BottomNav />
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
