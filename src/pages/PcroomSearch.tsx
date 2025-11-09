import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Navigation } from "@/components/Navigation";
import { BottomNav } from "@/components/BottomNav";
import api from "@/api/axiosInstance";
import { useUser } from "@/context/UserProvider";

interface Pcroom {
    pcroomId: number;
    nameOfPcroom: string;
    utilization?: number;
}

interface Favorite {
    pcroomId: number;
    nameOfPcroom: string;
}

const PcroomSearch = () => {
    const { user } = useUser();
    const navigate = useNavigate();
    const [pcrooms, setPcrooms] = useState<Pcroom[]>([]);
    const [favorites, setFavorites] = useState<Favorite[]>([]);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(false);
    const [favLoading, setFavLoading] = useState(false);
    const token = localStorage.getItem("jwt");

    useEffect(() => {
        if (!token) navigate("/auth");
        else fetchFavorites();
    }, [token, navigate]);

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

    const fetchFavorites = async () => {
        setFavLoading(true);
        const data = await safeApiGet("/favorites");
        if (Array.isArray(data)) setFavorites(data);
        else setFavorites([]);
        setFavLoading(false);
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
                    {/* 헤더 */}
                    <div className="mb-6">
                        <h1 className="text-4xl font-bold mb-2 bg-gradient-primary bg-clip-text text-transparent">
                            PC방 즐겨찾기
                        </h1>
                    </div>

                    {/* 검색 영역 — 헤더 바로 아래로 이동 */}
                    {/* 검색 기능 */}
                    <Card className="shadow-subtle bg-gradient-card border-primary/20 mb-8">
  <CardHeader>
    <CardTitle>Search Pcrooms</CardTitle>
    <CardDescription>검색 후 즐겨찾기에 추가할 수 있습니다</CardDescription>
  </CardHeader>
  <CardContent>
    {/* Search Bar */}
    <div className="mb-6">
      <div className="relative flex w-full items-center">
        

        {/* 입력창 */}
        {/* 입력창 */}
<input
  type="text"
  value={search}
  onChange={(e) => setSearch(e.target.value)}
  placeholder="PC방 검색"
  className="border border-border p-2 rounded-md flex-1 focus:border-primary focus:ring-1 focus:ring-primary transition-all"
/>

{/* 우측 버튼 */}
<Button
  size="sm"
  className="absolute right-2 bg-gradient-primary shadow-elegant h-9 px-4 rounded-md"
  onClick={handleSearch}
>
  Search
</Button>

      </div>
    </div>

    {loading ? (
      <div className="text-center text-muted-foreground">Loading...</div>
    ) : (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {pcrooms.map((pcroom) => (
          <Card
            key={pcroom.pcroomId}
            className="p-4 hover:shadow-elegant transition-all duration-300 border border-border"
          >
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-lg">{pcroom.nameOfPcroom}</h3>
              <Button
                size="sm"
                className="bg-gradient-primary shadow-elegant"
                onClick={() => addFavorite(pcroom.pcroomId)}
              >
                추가
              </Button>
            </div>
          </Card>
        ))}
      </div>
    )}
  </CardContent>
</Card>

                    {/* 즐겨찾기 목록 */}
                    <Card className="shadow-subtle bg-gradient-card border-primary/20 mb-8">
                        <CardHeader>
                            <CardTitle>My Favorites</CardTitle>
                            <CardDescription>현재 즐겨찾기한 PC방 목록입니다</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {favLoading ? (
                                <div className="text-center text-muted-foreground">Loading...</div>
                            ) : favorites.length === 0 ? (
                                <div className="text-center text-muted-foreground">
                                    즐겨찾기한 PC방이 없습니다
                                </div>
                            ) : (
                                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                    {favorites.map((fav) => (
                                        <Card
                                            key={fav.pcroomId}
                                            className="p-4 shadow-subtle hover:shadow-elegant transition-all duration-300 border border-border"
                                        >
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
                                        </Card>
                                    ))}
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

export default PcroomSearch;
