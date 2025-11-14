// src/pages/ManagerDashboard.tsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Navigation } from "@/components/Navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Crown, Plus, X } from "lucide-react";
import { useUser } from "@/context/UserProvider";
import api from "@/api/axiosInstance";
import { BottomNav } from "@/components/BottomNav";
import { Button } from "@/components/ui/button";

interface ManagerFavorite {
  pcroomId: number;
  nameOfPcroom?: string;
  pcroomName?: string;
  utilization?: number;
  recordedAt: string;
}

const ManagerDashboard = () => {
  const { user } = useUser();
  const navigate = useNavigate();
  const token = localStorage.getItem("jwt");

  const [pcrooms, setPcrooms] = useState<ManagerFavorite[]>([]);
  const [utilizationData, setUtilizationData] = useState<ManagerFavorite[]>([]);
  const [searchResults, setSearchResults] = useState<ManagerFavorite[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (!token) navigate("/auth");
    else if (user?.role === "USER") navigate("/dashboard");
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
    const data = await safeApiGet("/manager-favorites/favorite");
    setPcrooms(Array.isArray(data) ? data : []);
  };

  const fetchUtilization = async () => {
    setLoading(true);
    const data = await safeApiGet("/manager-favorites?hours=24");
    setUtilizationData(Array.isArray(data) ? data : []);
    setLoading(false);
  };

  const handleSearch = async () => {
    const trimmed = search.trim();
    if (!trimmed) return setSearchResults([]);
    const data = await safeApiGet("/pcrooms", { params: { name: trimmed } });
    setSearchResults(Array.isArray(data) ? data : []);
  };

  const addFavorite = async (pcroomId: number) => {
    try {
      await api.post(`/manager-favorites/${pcroomId}`);
      fetchPcrooms();
      fetchUtilization();
      setSearchResults(prev => prev.filter(pc => pc.pcroomId !== pcroomId));
    } catch (err) {
      console.error(err);
    }
  };

  const removeFavorite = async (pcroomId: number) => {
    try {
      await api.delete(`/manager-favorites/${pcroomId}`);
      fetchPcrooms();
      fetchUtilization();
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (token) {
      fetchPcrooms();
      fetchUtilization();
    }
  }, [token]);

  const groupByHour = (data: ManagerFavorite[]) =>
    data.reduce<Record<string, ManagerFavorite[]>>((acc, pc) => {
      const hour = new Date(pc.recordedAt).toLocaleString(undefined, { hour: '2-digit', minute: '2-digit' });
      if (!acc[hour]) acc[hour] = [];
      acc[hour].push(pc);
      return acc;
    }, {});

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <Navigation />
      <main className="container mx-auto px-3 sm:px-4 pt-24 pb-20">
        <div className="max-w-2xl mx-auto animate-fade-in">

          {/* 계정 정보 & 피시방 등록 */}
          <div className="grid gap-6 md:grid-cols-2 mb-8">
            <Card className="shadow-subtle hover:shadow-elegant transition-all duration-300">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Crown className="w-5 h-5 text-primary" />
                  계정 정보
                </CardTitle>
                <CardDescription>로그인한 관리자 계정</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div>Email: {user?.sub ?? "Loading..."}</div>
                  <div>ROLE: {user?.role ?? "Loading..."}</div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-subtle hover:shadow-elegant transition-all duration-300">
              <CardHeader>
                <CardTitle>피시방 추가</CardTitle>
                <CardDescription>새 피시방 등록</CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  size="lg"
                  className="bg-gradient-primary shadow-elegant"
                  onClick={() => navigate("/manager-dashboard/pcroom-form")}
                >
                  피시방 등록
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* 검색 모달 트리거 */}
          <Button
            className="mb-6 bg-gradient-primary shadow-elegant"
            onClick={() => setShowModal(true)}
          >
            PC방 검색
          </Button>

          {/* 관리 중인 경쟁 피시방 */}
          <Card className="shadow-subtle bg-gradient-card border-primary/20 mb-8">
            <CardHeader>
              <CardTitle>Managed Pcrooms</CardTitle>
              <CardDescription>관리 중인 경쟁 피시방 리스트</CardDescription>
            </CardHeader>
            <CardContent>
              {pcrooms.length === 0 ? (
                <div className="text-center text-muted-foreground py-4">관리 중인 피시방이 없습니다</div>
              ) : (
                <div className="grid gap-3">
                  {pcrooms.map(pc => (
                    <div
                      key={pc.pcroomId}
                      className="flex items-center justify-between border border-border rounded-lg p-3 hover:shadow-md transition-all bg-muted/40"
                    >
                      <span>{pc.nameOfPcroom || pc.pcroomName}</span>
                      <Button size="sm" onClick={() => removeFavorite(pc.pcroomId)}>삭제</Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* 경쟁 피시방 가동률 */}
          <Card className="shadow-subtle bg-gradient-card border-primary/20 mb-8">
            <CardHeader>
              <CardTitle>Competitor Pcrooms Utilization</CardTitle>
              <CardDescription>최근 24시간 등록된 경쟁 피시방 가동률</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center text-muted-foreground py-4">Loading...</div>
              ) : (
                Object.entries(
                  groupByHour([...utilizationData].sort((a, b) =>
                    new Date(b.recordedAt).getTime() - new Date(a.recordedAt).getTime()
                  ))
                ).map(([hour, pcs]) => (
                  <div key={hour} className="mb-4">
                    <h3 className="text-sm font-semibold mb-2">{hour}</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {pcs.map(pc => (
                        <div
                          key={`${pc.pcroomId}-${pc.recordedAt}`}
                          className="p-3 border border-border rounded-lg shadow-sm hover:shadow-md transition-all"
                        >
                          <p className="font-medium">{pc.nameOfPcroom || pc.pcroomName}</p>
                          <span className="text-sm text-muted-foreground">
                            {(pc.utilization ?? 0).toFixed(2)}%
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* 검색 모달 */}
          {showModal && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
              <div className="bg-card text-foreground rounded-xl shadow-elegant p-6 w-[90%] max-w-2xl relative animate-fade-in border border-border">
                <button
                  onClick={() => setShowModal(false)}
                  className="absolute top-4 right-4 flex items-center justify-center w-9 h-9 rounded-full bg-muted text-muted-foreground shadow-sm hover:bg-accent hover:text-accent-foreground"
                >
                  <X size={18} strokeWidth={2} />
                </button>

                <h2 className="text-xl font-semibold mb-4">PC방 검색</h2>

                <div className="flex gap-2 mb-4">
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="PC방 이름 입력"
                    className="flex-1 h-11 px-3 rounded-lg border border-border bg-background text-foreground text-sm focus:border-primary focus:ring-1 focus:ring-primary"
                  />
                  <Button className="h-11 px-5 text-sm font-semibold bg-gradient-primary" onClick={handleSearch}>
                    검색
                  </Button>
                </div>

                {loading ? (
                  <div className="text-center text-muted-foreground">Loading...</div>
                ) : (
                  <div className="grid gap-3">
                    {searchResults.length === 0 ? (
                      <p className="text-muted-foreground text-center">검색 결과가 없습니다.</p>
                    ) : (
                      searchResults.map(pc => (
                        <div
                          key={pc.pcroomId}
                          className="flex items-center justify-between border border-border rounded-lg p-3 hover:shadow-md transition-all bg-muted/40"
                        >
                          <span>{pc.nameOfPcroom || pc.pcroomName}</span>
                          <Button size="sm" onClick={() => addFavorite(pc.pcroomId)}>등록</Button>
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

export default ManagerDashboard;
