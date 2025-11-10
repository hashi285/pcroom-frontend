// src/pages/Dashboard.tsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Navigation } from "@/components/Navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, Calendar } from "lucide-react";
import { useUser } from "@/context/UserProvider";
import api from "@/api/axiosInstance";
import { BottomNav } from "@/components/BottomNav";
import { Button } from "@/components/ui/button";
import { Plus, X } from "lucide-react";

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
  const [showModal, setShowModal] = useState(false);

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

  // ✅ 수정된 부분: 낙관적 업데이트 + 모달 유지 + 검색결과 즉시 제거
  const addFavorite = async (pcroomId: number) => {
    // 클릭 즉시 목록에서 제거 (UI 반응 빠르게)
    setPcrooms((prev) => prev.filter((p) => p.pcroomId !== pcroomId));

    try {
      await api.post(`/favorites/${pcroomId}`);
      fetchFavorites(); // 즐겨찾기 목록 갱신
    } catch (err) {
      console.error(err);
      fetchFavorites();
      handleSearch(); // 실패 시 검색 결과 복원
    }
  };

  const handleSearch = async () => {
    if (!search.trim()) return;
    setLoading(true);
    const data = await safeApiGet("/pcrooms", { params: { name: search } });
    if (Array.isArray(data)) setPcrooms(data);
    else if (data?.pcrooms && Array.isArray(data.pcrooms)) setPcrooms(data.pcrooms);
    else setPcrooms([]);
    setLoading(false);
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

          {/* 즐겨찾기 카드 */}
          <Card className="shadow-subtle bg-gradient-card border-primary/20 rounded-xl w-full">
            <CardHeader>
              <CardTitle>
                <span className="font-semibold">내 피시방</span>
              </CardTitle>
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
                <CardTitle className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Mail className="w-5 h-5 text-primary" />
                    <span className="font-semibold">공지사항</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground truncate max-w-[70%]">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <span>06-15: 시스템 점검 안내</span>
                  </div>
                </CardTitle>
              </CardHeader>
            </Card>

          </div>


          <div className="mt-8">
            <Card className="shadow-subtle bg-gradient-card border-primary/20 rounded-xl w-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="w-5 h-5 text-primary" />
                  <span className="font-semibold">업데이트 소식</span>
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

          {/* Floating Button → 검색 모달 열기 */}
          <div className="pointer-events-none fixed bottom-20 right-6 z-50 flex justify-end">
            <button
              className="pointer-events-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary text-white shadow-lg shadow-primary/30 transition-transform hover:scale-105"
              onClick={() => setShowModal(true)}
            >
              <Plus size={24} />
            </button>
          </div>

          {/* 검색 모달 */}
          {showModal && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
              <div className="bg-white rounded-xl shadow-lg p-6 w-[90%] max-w-2xl relative animate-fade-in">
                <button
                  onClick={() => setShowModal(false)}
                  className="absolute top-4 right-4 flex items-center justify-center w-9 h-9 rounded-full bg-slate-100 text-slate-500 shadow-sm transition-all hover:bg-slate-200 hover:text-slate-800 hover:shadow-md active:scale-95"
                >
                  <X size={18} strokeWidth={2} />
                </button>

                <h2 className="text-xl font-semibold mb-4">PC방 검색</h2>

                <div className="flex gap-2 mb-4 items-center">
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="PC방 이름 입력"
                    className="flex-1 h-11 px-3 rounded-lg border border-border text-sm focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                  />
                  <Button
                    className="h-11 px-5 text-sm font-semibold bg-gradient-primary shadow-elegant hover:opacity-90 transition-all"
                    onClick={handleSearch}
                  >
                    검색
                  </Button>
                </div>

                {loading ? (
                  <div className="text-center text-muted-foreground">Loading...</div>
                ) : (
                  <div className="grid gap-3">
                    {pcrooms.length === 0 ? (
                      <p className="text-muted-foreground text-center">검색 결과가 없습니다.</p>
                    ) : (
                      pcrooms.map((pcroom) => (
                        <div
                          key={pcroom.pcroomId}
                          className="flex items-center justify-between border border-border rounded-lg p-3 hover:shadow-md transition-all"
                        >
                          <span className="font-medium">{pcroom.nameOfPcroom}</span>
                          {/* 아이콘 버튼으로 변경 */}
                          <button
                            className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-white shadow-md hover:scale-105 transition-transform"
                            onClick={() => addFavorite(pcroom.pcroomId)}
                          >
                            <Plus size={20} />
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          <BottomNav />
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
