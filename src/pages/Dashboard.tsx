// src/pages/Dashboard.tsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Navigation } from "@/components/Navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, Calendar, Crown } from "lucide-react";
import { useUser } from "@/context/UserProvider";
import api from "@/api/axiosInstance";

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

    // ADMIN이면 manager-dashboard로 이동
    if (user?.role === "ADMIN") {
      console.log(user?.role + "입니다.")
      navigate("/manager-dashboard");
      return;
    }
  }, [token, user, navigate]);

  // 안전한 GET 요청 wrapper
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

  // PC방 목록 가져오기
  const fetchPcrooms = async () => {
    const data = await safeApiGet("/pcrooms");
    if (Array.isArray(data)) setPcrooms(data);
    else if (data && data.pcrooms && Array.isArray(data.pcrooms)) setPcrooms(data.pcrooms);
    else setPcrooms([]);
  };

  // 즐겨찾기 목록 가져오기
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
      setFavorites(favoritesWithUtil);
    } else {
      setFavorites([]);
    }
    setLoading(false);
  };

  // 초기 로딩
  useEffect(() => {
    if (token) {
      fetchPcrooms();
      fetchFavorites();
    }
  }, [token]);

  // 검색
  const handleSearch = async () => {
    const data = await safeApiGet("/pcrooms", { params: { name: search } });
    if (Array.isArray(data)) setPcrooms(data);
    else if (data && data.pcrooms && Array.isArray(data.pcrooms)) setPcrooms(data.pcrooms);
    else setPcrooms([]);
  };

  // 즐겨찾기 추가
  const addFavorite = async (pcroomId: number) => {
    if (!token) return;
    try {
      await api.post(`/favorites/${pcroomId}`);
      fetchFavorites();
    } catch (err) {
      console.error(err);
    }
  };

  // 즐겨찾기 삭제
  const removeFavorite = async (pcroomId: number) => {
    if (!token) return;
    try {
      await api.delete(`/favorites/${pcroomId}`);
      fetchFavorites();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <Navigation />
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12">
        <div className="max-w-4xl mx-auto animate-fade-in">

          {/* Dashboard Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2 bg-gradient-primary bg-clip-text text-transparent">
              Welcome to Your Dashboard
            </h1>
            <p className="text-muted-foreground">Manage your membership and access exclusive features</p>
          </div>

          {/* 계정 정보 카드 */}
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
                  <Mail className="w-5 h-5 text-primary" />
                  Account Details
                </CardTitle>
                <CardDescription>Your profile information</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="w-4 h-4 text-muted-foreground" />
                    <span className="font-medium">{user?.sub || "Guest"}</span>
                  </div>
                  {user?.userId && (
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      <span className="text-muted-foreground">User ID: {user.userId}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* PC방 검색 & 즐겨찾기 추가 */}
          <Card className="shadow-subtle bg-gradient-card border-primary/20 mb-8">
            <CardHeader>
              <CardTitle>Search Prooms</CardTitle>
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
                <button
                  onClick={handleSearch}
                  className="px-4 py-2 bg-primary text-white rounded hover:bg-primary/80"
                >
                  Search
                </button>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {pcrooms.map((pcroom) => (
                  <Card key={pcroom.pcroomId} className="p-4 hover:bg-accent transition-colors cursor-pointer border border-border">
                    <CardHeader>
                      <CardTitle>{pcroom.nameOfPcroom}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <button
                        className="text-green-500 text-sm"
                        onClick={() => addFavorite(pcroom.pcroomId)}
                      >
                        Add Favorite
                      </button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* 즐겨찾기 목록 */}
          <Card className="shadow-subtle bg-gradient-card border-primary/20">
            <CardHeader>
              <CardTitle>My Favorites</CardTitle>
              <CardDescription>PC방 즐겨찾기 목록</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center text-muted-foreground">Loading...</div>
              ) : favorites.length === 0 ? (
                <div className="text-center text-muted-foreground">No favorites yet</div>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {favorites.map((fav) => (
                    <Card key={fav.pcroomId} className="p-4 hover:bg-accent transition-colors cursor-pointer border border-border">
                      <CardHeader>
                        <CardTitle>{fav.nameOfPcroom}</CardTitle>
                        <CardDescription>
                          PC방 ID: {fav.pcroomId} <br />
                          가동률: {fav.utilization ?? 0}%
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <button
                          className="text-red-500 text-sm"
                          onClick={() => removeFavorite(fav.pcroomId)}
                        >
                          Remove
                        </button>
                      </CardContent>
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
