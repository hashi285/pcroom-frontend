import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Navigation } from "@/components/Navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, Calendar, Plus, X } from "lucide-react";
import { useUser } from "@/context/UserProvider";
import api from "@/api/axiosInstance";
import { BottomNav } from "@/components/BottomNav";
import { Button } from "@/components/ui/button";

interface Favorite {
  pcroomId: number;
  nameOfPcroom: string;
  utilization?: number;
  seatCount?: number;
  usedSeatCount?: number;
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

  const [seatType, setSeatType] = useState("1");
  const [seatDropdownOpen, setSeatDropdownOpen] = useState(false);

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

  const addFavorite = async (pcroomId: number) => {
    setPcrooms((prev) => prev.filter((p) => p.pcroomId !== pcroomId));

    try {
      await api.post(`/favorites/${pcroomId}`);
      fetchFavorites();
    } catch (err) {
      console.error(err);
      fetchFavorites();
      handleSearch();
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
          return {
            ...fav,
            utilization: utilRes?.utilization ?? 0,
            seatCount: utilRes?.seatCount ?? 0,
            usedSeatCount: utilRes?.usedSeatCount ?? 0,
          };
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
          {/* 내 피시방 카드 */}
          <Card className="shadow-subtle bg-gradient-card border-primary/20 rounded-xl w-full">
            <CardHeader className="flex items-start justify-between">
              <div>
                <CardTitle className="text-foreground/90">내 피시방</CardTitle>
                <CardDescription className="text-muted-foreground">
                  PC방 즐겨찾기 목록 (최신 추가순)
                </CardDescription>
              </div>

              {/* 좌석 유형 선택 */}
              <div className="relative inline-block">
                {/* 버튼 */}
                <button
                  className="flex items-center justify-between gap-2 rounded-full bg-zinc-300/100 dark:bg-zinc-800 py-1.5 pl-3 pr-2 text-sm shadow-sm transition-colors duration-150 hover:bg-zinc-400/100 dark:hover:bg-zinc-700"
                  onClick={() => setSeatDropdownOpen(!seatDropdownOpen)}
                >
                  <span className="font-medium text-zinc-900 dark:text-white transition-colors duration-150">
                    사용할 인원 수 : {seatType}
                  </span>
                  <span className="material-symbols-outlined text-base text-zinc-500 dark:text-zinc-400 transition-colors duration-150">
                    expand_more
                  </span>
                </button>

                {/* 드롭다운 */}
                {seatDropdownOpen && (
                  <div className="absolute top-full z-10 mt-2 w-48 origin-top-left overflow-hidden rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white/100 dark:bg-zinc-900 shadow-xl transition-colors duration-150">
                    <ul className="flex flex-col text-sm">
                      {["1", "2", "3", "4", "5"].map((type) => (
                        <li key={type}>
                          <a
                            className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors duration-150 ${seatType === type
                              ? "bg-primary/20 text-primary dark:text-primary"
                              : "text-zinc-900 dark:text-white hover:bg-zinc-100 dark:hover:bg-zinc-700"
                              }`}
                            onClick={() => {
                              setSeatType(type);
                              setSeatDropdownOpen(false);
                            }}
                          >
                            <span className="material-symbols-outlined text-lg">
                              {type === "2"
                                ? "chair"
                                : type === "3"
                                  ? "people"
                                  : "stadia_controller"}
                            </span>
                            <span>{type}</span>
                            {seatType === type && (
                              <span className="material-symbols-outlined ml-auto text-lg text-primary">
                                check
                              </span>
                            )}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

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
                    const used = fav.usedSeatCount ?? 0;
                    const total = fav.seatCount ?? 0;

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
                              <p className="font-medium text-foreground truncate">
                                {fav.nameOfPcroom}
                              </p>
                              <span className="text-sm text-muted-foreground">
                                {used}/{total}석
                              </span>
                            </div>
                          </div>

                          <span
                            className="material-symbols-outlined text-muted-foreground text-2xl"
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

          {/* 광고 카드 2 */}
          <div className="mt-8">
            <Card className="shadow-subtle bg-gradient-card border-primary/20 rounded-xl w-full">
              <CardContent className="p-0">
                <div
                  className="w-full bg-center bg-no-repeat bg-cover flex flex-col justify-between overflow-hidden rounded-xl min-h-[120px] p-4 relative"
                  style={{
                    backgroundImage: `url("https://lh3.googleusercontent.com/aida-public/AB6AXuDUxBlwdFeOkZLszxSz74EVxCDi9otuUPvEjA-bx4VYprqWbDy-TqQg41jV88Opm1IEZdxiSEzwGS7vENd1p3-Zmvgy-BM3FVjjV7A-xg-dxTayq5MJOIurnasKRImxXBdrQXmHzHN3wk4q9fYgG6UwrA2H9ZWW33bvsoTFDWIbV1oWHSidrWK_h71iMiZnjEyQa-Wbs2UUsaKVR8j8FWxyl_MJp9q8N84T4KTLa-VBAAonwg3kPSQJaVuFU497t0yytg5f20UT3Cy5")`,
                  }}
                  aria-label="advertisement for a new fantasy RPG game"
                >
                  {/* 검은색 오버레이 */}
                  <div className="absolute inset-0 bg-black/40 rounded-xl"></div>

                  {/* 내용 */}
                  <div className="relative flex flex-col z-10">
                    <span className="text-xs font-semibold bg-black/50 text-white rounded-full px-2 py-0.5 w-fit">
                      AD
                    </span>
                    <h3 className="text-white text-lg font-bold mt-2">
                      이터널 소드 신규 시즌 오픈
                    </h3>
                    <p className="text-gray-200 text-sm">
                      지금 접속하고 한정판 스킨 받으세요!
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 광고 카드 */}
          <div className="mt-8">
            <div className="shadow-subtle bg-gradient-card border border-primary/20 rounded-xl w-full">
              <div className="p-0">
                <div className="p-4 border-b border-white/10 bg-[#1E1E1E]/50 rounded-lg flex flex-col @xl:flex-row @xl:items-start gap-4">
                  {/* 이미지 */}
                  <div
                    className="w-full @xl:w-40 @xl:flex-shrink-0 bg-center bg-no-repeat aspect-video @xl:aspect-square bg-cover rounded-lg"
                    style={{
                      backgroundImage: `url("https://lh3.googleusercontent.com/aida-public/AB6AXuARs6qyCjs5SY_YTInVubnjuZkUfrq6e1aiz-z4ZANitK-uG3g9TN964TqNOUtx0vgX6gvAx_vi--GRjQGgQLA5G6PiD-_j_rT1rXjfH7BREDmAQqM_SSkQdCKAk9L3--uJY3ZwhifUb-uNmGeMl2XJP3FUqwzwLVKvola7o2Tubu2CBfZX9xbBDpl0Hs5MqT20_CvIRLK_B2hJvym05DWjyDSuQ2bDiXHh34GPSIovErNnCfy2V0Ozk3azrXC-AwGXWHh8PZgbWxs0")`,
                    }}
                    aria-label="Close up on a delicious ramen dish"
                  />

                  {/* 내용 */}
                  <div className="flex w-full min-w-0 grow flex-col items-stretch justify-center gap-1.5">
                    <div className="flex items-center gap-2">
                      <p className="text-[#A9A9A9] text-sm font-semibold">Sponsored</p>
                      <span className="text-xs font-semibold bg-primary/20 text-primary rounded-full px-2 py-0.5">
                        AD
                      </span>
                    </div>

                    <p className="text-white text-lg font-bold leading-tight tracking-[-0.015em]">
                      이번 주말엔 피캉스! 라면이 공짜!
                    </p>

                    <p className="text-[#A9A9A9] text-base font-normal leading-normal">
                      블랙홀 PC방 강남점에서 진행하는 특별 이벤트
                    </p>

                    <div className="flex items-end gap-3 justify-between mt-2">
                      <p className="text-[#A9A9A9] text-base font-normal leading-normal">
                        지금 바로 확인해보세요!
                      </p>

                      <button className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-8 px-4 bg-primary text-white text-sm font-medium leading-normal">
                        <span className="truncate">쿠폰 받기</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 플로팅 버튼 */}
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
              <div className="bg-card text-foreground rounded-xl shadow-elegant p-6 w-[90%] max-w-2xl relative animate-fade-in border border-border">
                <button
                  onClick={() => setShowModal(false)}
                  className="absolute top-4 right-4 flex items-center justify-center w-9 h-9 rounded-full bg-muted text-muted-foreground shadow-sm transition-all hover:bg-accent hover:text-accent-foreground active:scale-95"
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
                    className="flex-1 h-11 px-3 rounded-lg border border-border bg-background text-foreground text-sm focus:border-primary focus:ring-1 focus:ring-primary transition-all"
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
                          className="flex items-center justify-between border border-border rounded-lg p-3 hover:shadow-md transition-all bg-muted/40"
                        >
                          <span className="font-medium text-foreground">{pcroom.nameOfPcroom}</span>

                          <button
                            className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-md hover:scale-105 transition-transform"
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
