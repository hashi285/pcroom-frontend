// src/pages/ManagerDashboard.tsx
import { useEffect, useState } from "react";
import { Navigation } from "@/components/Navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Crown } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useUser } from "@/context/UserProvider";
import api from "@/api/axiosInstance";
import {BottomNav} from "@/components/BottomNav";

interface ManagerFavorite {
  pcroomId: number;
  nameOfPcroom?: string; // 검색 API용
  pcroomName?: string;   // 경쟁 피시방 API용
  utilization?: number;
  recordedAt: string;
}

const ManagerDashboard = () => {
  const { user } = useUser();
  const [pcrooms, setPcrooms] = useState<ManagerFavorite[]>([]); // 전체 관리 피시방
  const [utilizationData, setUtilizationData] = useState<ManagerFavorite[]>([]); // 최근 24시간 가동률 데이터
  const [searchResults, setSearchResults] = useState<ManagerFavorite[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const navigate = useNavigate();
  const token = localStorage.getItem("jwt");

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

  /** 검색 기능 */
  const handleSearch = async () => {
    const trimmed = search.trim();
    if (!trimmed) {
      setSearchResults([]);
      return;
    }
    const data = await safeApiGet("/pcrooms", { params: { name: trimmed } });
    if (Array.isArray(data)) setSearchResults(data);
    else setSearchResults([]);
  };

  /** 관리 피시방 전체 조회 */
  const fetchManagerFavoritesList = async () => {
    const data = await safeApiGet("/manager-favorites/favorite");
    if (Array.isArray(data)) {
      setPcrooms(data);
    } else {
      setPcrooms([]);
    }
  };

  /** 최근 24시간 가동률 데이터 조회 */
  const fetchManagerFavoritesUtilization = async () => {
    setLoading(true);
    const data = await safeApiGet("/manager-favorites?hours=24");
    if (Array.isArray(data)) {
      setUtilizationData(data);
    } else {
      setUtilizationData([]);
    }
    setLoading(false);
  };

  const addFavorite = async (pcroomId: number) => {
    if (!token) return;
    try {
      await api.post(`/manager-favorites/${pcroomId}`);
      fetchManagerFavoritesList();
      fetchManagerFavoritesUtilization();
      setSearchResults(prev => prev.filter(pc => pc.pcroomId !== pcroomId));
    } catch (err) {
      console.error("Failed to add manager favorite:", err);
    }
  };

  const removeFavorite = async (pcroomId: number) => {
    if (!token) return;
    try {
      await api.delete(`/manager-favorites/${pcroomId}`);
      fetchManagerFavoritesList();
      fetchManagerFavoritesUtilization();
    } catch (err) {
      console.error("Failed to delete manager favorite:", err);
    }
  };

  useEffect(() => {
    if (!token) navigate("/auth");
    else if (user?.role === "USER") navigate("/dashboard");
  }, [token, user, navigate]);

  useEffect(() => {
    if (token) {
      fetchManagerFavoritesList();
      fetchManagerFavoritesUtilization();
    }
  }, [token]);

  useEffect(() => {
    const interval = setInterval(() => {
      fetchManagerFavoritesList();
      fetchManagerFavoritesUtilization();
    }, 3 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  /** 시간대별 그룹화 */
  const groupByHour = (data: ManagerFavorite[]) =>
    data.reduce<Record<string, ManagerFavorite[]>>((acc, pc) => {
      const hour = new Date(pc.recordedAt).toLocaleString(undefined, { hour: '2-digit', minute: '2-digit' });
      if (!acc[hour]) acc[hour] = [];
      acc[hour].push(pc);
      return acc;
    }, {});

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 p-6">
      <Navigation />
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12">
        <div className="max-w-5xl mx-auto animate-fade-in">

          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2 bg-gradient-primary bg-clip-text text-transparent">
              Manager Dashboard
            </h1>
            <p className="text-muted-foreground">
              관리 중인 경쟁 피시방의 실시간 가동률을 확인할 수 있습니다
            </p>
          </div>

          {/* User Info & 등록 버튼 */}
          <div className="grid gap-6 md:grid-cols-2 mb-8">
            <Card className="shadow-subtle hover:shadow-elegant transition-all duration-300">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Crown className="w-5 h-5 text-primary" />
                  계정 정보
                </CardTitle>
                <CardDescription>로그인한 관리자 계정 정보</CardDescription>
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
                <CardTitle className="flex items-center gap-2">
                  피시방 추가
                </CardTitle>
                <CardDescription>새 피시방을 등록합니다</CardDescription>
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

          {/* 검색 기능 */}
          <Card className="shadow-subtle bg-gradient-card border-primary/20 mb-8">
            <CardHeader>
              <CardTitle>Search Pcrooms</CardTitle>
              <CardDescription>검색 후 경쟁 피시방으로 등록할 수 있습니다</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2 mb-4">
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="PC방 이름 검색"
                  className="border p-2 rounded flex-1"
                />
                <Button
                  size="lg"
                  onClick={handleSearch}
                  className="bg-gradient-primary shadow-elegant"
                >
                  Search
                </Button>
              </div>

              {searchResults.length > 0 && (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {searchResults.map((pcroom, index) => (
                    <Card
                      key={`search-${pcroom.pcroomId}-${index}`}
                      className="p-4 hover:bg-accent transition-colors cursor-pointer border border-border"
                    >
                      <CardHeader>
                        <CardTitle>{pcroom.nameOfPcroom || pcroom.pcroomName}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <Button
                          size="lg"
                          className="bg-gradient-primary shadow-elegant"
                          onClick={() => addFavorite(pcroom.pcroomId)}
                        >
                          경쟁 피시방 등록
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* 관리 중인 경쟁 피시방 */}
          <Card className="shadow-subtle bg-gradient-card border-primary/20 mb-8">
            <CardHeader>
              <CardTitle>Managed Pcrooms</CardTitle>
              <CardDescription>관리 중인 경쟁 피시방 리스트</CardDescription>
            </CardHeader>
            <CardContent>
              {pcrooms.length === 0 ? (
                <div className="text-center text-muted-foreground">관리 중인 피시방이 없습니다</div>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {pcrooms.map((pc, index) => (
                    <Card key={`${pc.pcroomId}-managed-${index}`} className="p-4 shadow-subtle">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-lg">{pc.nameOfPcroom || pc.pcroomName}</h3>
                        <Button
                          size="lg"
                          className="bg-gradient-primary shadow-elegant"
                          onClick={() => removeFavorite(pc.pcroomId)}
                        >
                          삭제
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

{/* 시간대별 경쟁 피시방 가동률 */}
<Card className="shadow-subtle bg-gradient-card border-primary/20">
  <CardHeader>
    <CardTitle>Competitor Pcrooms Utilization</CardTitle>
    <CardDescription>최근 24시간 내 등록된 경쟁 피시방의 가동률</CardDescription>
  </CardHeader>
  <CardContent>
    {loading ? (
      <div className="text-center text-muted-foreground">Loading...</div>
    ) : (
      <>
        {Object.entries(
          groupByHour(
            [...utilizationData].sort(
              (a, b) => new Date(b.recordedAt).getTime() - new Date(a.recordedAt).getTime()
            )
          )
        ).map(([hour, pcs]) => (
          <div key={hour} className="mb-4">
            <h3 className="text-sm font-semibold mb-2">{hour}</h3>
            <div className="flex gap-2 overflow-x-auto">
              {pcs.map(pc => (
                <Card
                  key={`${pc.pcroomId}-${pc.recordedAt}`}
                  className="min-w-[200px] p-4 flex-shrink-0"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold">{pc.nameOfPcroom || pc.pcroomName}</span>
                    <span className="text-sm text-muted-foreground">
                      {((pc.utilization ?? 0)).toFixed(2)}%
                    </span>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        ))}
      </>
    )}
  </CardContent>
</Card>
<BottomNav/>

        </div>
      </main>
    </div>
  );
};

export default ManagerDashboard;
