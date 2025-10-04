import { useEffect, useState } from "react";
import { Navigation } from "@/components/Navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import axios from "axios";
import { Mail, Calendar, Crown } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";

interface Favorite {
  pcroomId: number;
  nameOfPcroom: string;
  utilization?: number; // 추가
};

interface Pcroom {
  pcroomId: number;
  nameOfPcroom: string;
  utilization?: number; // optional, 서버에서 받아올 값
}

const Dashboard = () => {
  const [user, setUser] = useState<User | null>(null);
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [pcrooms, setPcrooms] = useState<Pcroom[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("jwt");

  // Supabase 세션 가져오기
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

// 즐겨찾기 가져오기
const fetchFavorites = async () => {
  try {
    const response = await axios.get("http://localhost:8080/favorites", {
      headers: { Authorization: `Bearer ${token}` },
      withCredentials: true,
    });

    // 각 즐겨찾기 피시방의 utilization 가져오기
    const favoritesWithUtil = await Promise.all(
      response.data.map(async (fav: Favorite) => {
        try {
          const res = await axios.get(
            `http://localhost:8080/pcrooms/${fav.pcroomId}/utilization`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          return { ...fav, utilization: res.data.utilization };
        } catch (err) {
          console.error("Failed to fetch utilization for favorite", fav.pcroomId, err);
          return { ...fav, utilization: 0 };
        }
      })
    );

    setFavorites(favoritesWithUtil);
  } catch (error) {
    console.error("Failed to fetch favorites", error);
  } finally {
    setLoading(false);
  }
};

  useEffect(() => {
    fetchFavorites();
  }, []);

  // PC방 검색
  const handleSearch = async () => {
    try {
      const response = await axios.get("http://localhost:8080/pcrooms", {
        params: { name: search },
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true,
      });

      interface PcroomResponse {
        pcroomId: number;
        nameOfPcroom: string;
      }

      const data: Pcroom[] = (response.data as PcroomResponse[]).map((p) => ({
        pcroomId: p.pcroomId,
        nameOfPcroom: p.nameOfPcroom,
      }));

      // 각 피시방에 대한 utilization fetch
      const dataWithUtil = await Promise.all(
        data.map(async (pcroom) => {
          try {
            const res = await axios.get(
              `http://localhost:8080/pcrooms/${pcroom.pcroomId}/utilization`,
              { headers: { Authorization: `Bearer ${token}` } }
            );
            return { ...pcroom, utilization: res.data.utilization };
          } catch (err) {
            console.error("Failed to fetch utilization for", pcroom.pcroomId, err);
            return { ...pcroom, utilization: 0 };
          }
        })
      );

      setPcrooms(dataWithUtil);
    } catch (err) {
      console.error("Failed to search pcrooms", err);
    }
  };

  // 즐겨찾기 추가
  const addFavorite = async (pcroomId: number) => {
    try {
      await axios.post(`http://localhost:8080/favorites/${pcroomId}`, {}, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true,
      });
      fetchFavorites();
    } catch (err) {
      console.error("Failed to add favorite", err);
    }
  };

  // 즐겨찾기 삭제
  const removeFavorite = async (pcroomId: number) => {
    try {
      await axios.delete(`http://localhost:8080/favorites/${pcroomId}`, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true,
      });
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
            <p className="text-muted-foreground">
              Manage your membership and access exclusive features
            </p>
          </div>

          {/* Membership & Account */}
          <div className="grid gap-6 md:grid-cols-2 mb-8">
            <Card className="shadow-subtle hover:shadow-elegant transition-all duration-300">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Crown className="w-5 h-5 text-primary" />
                  Membership Status
                </CardTitle>
                <CardDescription>Your current plan and benefits</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="text-2xl font-bold text-primary">Free Tier</div>
                  <p className="text-sm text-muted-foreground">Upgrade to unlock premium features</p>
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
                    <span className="font-medium">{user?.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <span className="text-muted-foreground">
                      Joined {new Date(user?.created_at || "").toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* PC방 검색 & 즐겨찾기 추가 */}
          <Card className="shadow-subtle bg-gradient-card border-primary/20 mb-8">
            <CardHeader>
              <CardTitle>Search PCrooms</CardTitle>
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
                      <CardDescription>
                        PC방 ID: {pcroom.pcroomId} <br />
                        가동률: {pcroom.utilization ?? 0}%
                      </CardDescription>
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
