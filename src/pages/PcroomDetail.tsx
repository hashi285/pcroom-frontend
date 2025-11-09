// src/components/PcroomDashboardLayout.tsx
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import api from "@/api/axiosInstance";
import { BottomNav } from "@/components/BottomNav";
import { Navigation } from "@/components/Navigation";

interface Favorite {
    pcroomId: number;
    nameOfPcroom: string;
    utilization?: number;
    totalSeats?: number;
    occupiedSeats?: number;
}

const PcroomDetail = () => {
    const [favorites, setFavorites] = useState<Favorite[]>([]);
    const [loading, setLoading] = useState(true);
    const token = localStorage.getItem("jwt");

    const safeApiGet = async (url: string, config = {}) => {
        if (!token) return null;
        try {
            const res = await api.get(url, config);
            return res.data;
        } catch (err: any) {
            console.error(err);
            return null;
        }
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
                        totalSeats: utilRes?.totalSeats ?? 0,
                        occupiedSeats: utilRes?.occupiedSeats ?? 0,
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
        if (token) fetchFavorites();
    }, [token]);

    // 첫 번째 즐겨찾기 기준 데이터
    const firstFavorite = favorites[0];
    const utilization = firstFavorite?.utilization ?? 0;
    const occupiedSeats = firstFavorite?.occupiedSeats ?? 0;
    const totalSeats = firstFavorite?.totalSeats ?? 0;
    const emptySeats = totalSeats - occupiedSeats;

    // 가동률 색상 구분
    let utilizationColor = "text-slate-500 bg-slate-100";
    if (utilization >= 80) utilizationColor = "text-red-500 bg-red-500/10";
    else if (utilization >= 60) utilizationColor = "text-orange-500 bg-orange-500/10";
    else if (utilization >= 40) utilizationColor = "text-yellow-500 bg-yellow-500/10";
    else if (utilization > 0) utilizationColor = "text-green-500 bg-green-500/10";

    return (
        <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 p-6">
            <Navigation />
            <main className="container mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12">
                <div className="mb-8">
                    <h1 className="text-4xl font-bold mb-2 bg-gradient-primary bg-clip-text text-transparent">
                        <div className="inline-block align-middle text-lg font-semibold">
                            {firstFavorite?.nameOfPcroom ?? "PC방 상세 정보"}
                        </div>
                    </h1>
                </div>
                {/* Stats Cards */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                    <Card className={`p-4 flex items-center justify-between h-20 ${utilizationColor}`}>
                        <div>
                            <p className="text-sm font-medium leading-normal text-text-light-secondary dark:text-text-dark-secondary">
                                실시간 사용률
                            </p>
                            <p className="text-base font-bold mt-1">
                                {loading ? "..." : `${utilization.toFixed(0)}%`}
                            </p>
                        </div>
                    </Card>
                    <Card className="p-4 flex items-center justify-between h-20">
                        <div>
                            <p className="text-sm font-medium leading-normal text-text-light-secondary dark:text-text-dark-secondary">
                                총 좌석
                            </p>
                            <p className="text-base font-bold mt-1">{totalSeats}</p>
                        </div>
                    </Card>
                    <Card className="p-4 flex items-center justify-between h-20">
                        <div>
                            <p className="text-sm font-medium leading-normal text-text-light-secondary dark:text-text-dark-secondary">
                                사용 중
                            </p>
                            <p className="text-base font-bold text-status-in-use mt-1">{occupiedSeats}</p>
                        </div>
                    </Card>
                    <Card className="p-4 flex items-center justify-between h-20">
                        <div>
                            <p className="text-sm font-medium leading-normal text-text-light-secondary dark:text-text-dark-secondary">
                                빈자리
                            </p>
                            <p className="text-base font-bold mt-1">{emptySeats}</p>
                        </div>
                    </Card>
                </div>

                {/* 상세 분석 / 좌석 배치도 */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* 상세 분석 */}
                    <Card className="p-4 h-full">
                        <CardHeader>
                            <CardTitle className="text-sm font-medium leading-normal text-text-light-secondary dark:text-text-dark-secondary">
                                공지 시항
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {loading ? (
                                <p className="text-sm text-muted-foreground">Loading...</p>
                            ) : firstFavorite ? (
                                <div className="space-y-2 text-sm">
                                    <p>PC방: {firstFavorite.nameOfPcroom}</p>
                                    <p>총 좌석: {firstFavorite.totalSeats}</p>
                                    <p>사용 중 좌석: {firstFavorite.occupiedSeats}</p>
                                    <p>실시간 사용률: {firstFavorite.utilization?.toFixed(0)}%</p>
                                </div>
                            ) : (
                                <p className="text-sm text-muted-foreground">즐겨찾기 없음</p>
                            )}
                        </CardContent>
                    </Card>

                    {/* 좌석 배치도 */}
                    <Card className="p-4 h-full">
                        <CardHeader>
                            <CardTitle className="text-sm font-medium leading-normal text-text-light-secondary dark:text-text-dark-secondary">
                                좌석 배치도
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-6 gap-2">
                                {Array.from({ length: totalSeats }).map((_, idx) => {
                                    const isOccupied = idx < occupiedSeats;
                                    return (
                                        <div
                                            key={idx}
                                            className={`aspect-square rounded-md flex items-center justify-center text-xs font-bold ${isOccupied ? "bg-status-in-use text-white" : "bg-status-available text-white"
                                                }`}
                                        >
                                            {idx + 1}
                                        </div>
                                    );
                                })}
                            </div>
                        </CardContent>
                    </Card>
                    <BottomNav />
                </div>
            </main>
        </div>
    );
};

export default PcroomDetail;
