import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Navigation } from "@/components/Navigation";
import { BottomNav } from "@/components/BottomNav";
import api from "@/api/axiosInstance";
import { useUser } from "@/context/UserProvider";
import { Plus, X } from "lucide-react";

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
    const [showModal, setShowModal] = useState(false);
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

    const removeFavorite = async (pcroomId: number) => {
        try {
            await api.delete(`/favorites/${pcroomId}`);
            fetchFavorites();
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 p-6 relative">
            <Navigation />
            <main className="container mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12">
                <div className="max-w-5xl mx-auto animate-fade-in">
                    <div className="mb-6">
                        <h1 className="text-4xl font-bold mb-2 bg-gradient-primary bg-clip-text text-transparent">
                            PC방 즐겨찾기
                        </h1>
                    </div>

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
                                <div className="text-center text-muted-foreground">즐겨찾기한 PC방이 없습니다</div>
                            ) : (
                                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                    {favorites.map((fav) => (
                                        <Card
                                            key={fav.pcroomId}
                                            className="p-4 shadow-subtle hover:shadow-elegant transition-all duration-300 border border-border"
                                        >
                                            <div className="flex items-center justify-between">
                                                <h3 className="font-semibold text-lg">{fav.nameOfPcroom}</h3>
                                                <button
                                                    className="flex size-10 shrink-0 items-center justify-center rounded-full text-white transition-colors"
                                                    style={{ backgroundColor: "#646cffaa" }}
                                                    onClick={() => removeFavorite(fav.pcroomId)}
                                                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#646cff")}
                                                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#646cffaa")}
                                                >
                                                    <span className="material-symbols-outlined text-2xl">delete</span>
                                                </button>
                                            </div>
                                        </Card>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>

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

export default PcroomSearch;
