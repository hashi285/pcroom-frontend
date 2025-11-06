// src/pages/Dashboard.tsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Navigation } from "@/components/Navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, Calendar, Crown } from "lucide-react";
import { useUser } from "@/context/UserProvider";
import api from "@/api/axiosInstance";
import { Button } from "@/components/ui/button";

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

  const removeFavorite = async (pcroomId: number) => {
    try {
      await api.delete(`/favorites/${pcroomId}`);
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
              User Dashboard
            </h1>
            <p className="text-muted-foreground">
              즐겨찾기한 피시방의 정보를 관리할 수 있습니다
            </p>
          </div>

          {/* 계정 정보 */}
          <div className="grid gap-6 md:grid-cols-2 mb-8">
            <Card className="shadow-subtle hover:shadow-elegant transition-all duration-300">
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
            </Card>

            <Card className="shadow-subtle hover:shadow-elegant transition-all duration-300">
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
                    <span className="font-medium">2024-06-15:</span>
                    <div>공지사항이 등록되었습니다.</div>
                  </div>
                  {user?.userId && (
                    <div className="flex items-center gap-2 text-sm">
                      <span className="font-medium">첫 공지사항이 등록됩니다.</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 검색 기능 */}
          <Card className="shadow-subtle bg-gradient-card border-primary/20 mb-8">
            <CardHeader>
              <CardTitle>Search Pcrooms</CardTitle>
              <CardDescription>검색 후 즐겨찾기에 추가할 수 있습니다</CardDescription>
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
                  className="bg-gradient-primary shadow-elegant"
                  onClick={handleSearch}
                >
                  Search
                </Button>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {pcrooms.map((pcroom) => (
                  <Card
                    key={pcroom.pcroomId}
                    className="p-4 hover:shadow-elegant transition-all duration-300 border border-border"
                  >
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-lg">{pcroom.nameOfPcroom}</h3>
                      <Button
                        size="lg"
                        className="bg-gradient-primary shadow-elegant"
                        onClick={() => addFavorite(pcroom.pcroomId)}
                      >
                        추가
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* 즐겨찾기 목록 */}
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
                  {favorites.map((fav) => (
                    <Card
                      key={fav.pcroomId}
                      className="p-4 shadow-subtle hover:shadow-elegant transition-all duration-300 border border-border"
                    >
                      <div className="flex flex-col gap-3">
                        <div className="flex items-center justify-between">
                          <h3 className="font-semibold text-lg">{fav.nameOfPcroom}</h3>
                          <Button
                            size="sm"
                            className="bg-gradient-primary shadow-elegant"
                            onClick={() => removeFavorite(fav.pcroomId)}
                          >
                            삭제
                          </Button>
                        </div>
                        <div className="text-sm text-muted-foreground flex justify-between">
                          <span>가동률</span>
                          <span className="font-semibold text-primary">
                            {fav.utilization?.toFixed(2) ?? "0"}%
                          </span>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

        </div>
      </main>
    </div>
  );
};

export default Dashboard;
