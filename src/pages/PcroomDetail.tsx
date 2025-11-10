// src/components/PcroomDashboardLayout.tsx
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import api from "@/api/axiosInstance";
import { BottomNav } from "@/components/BottomNav";
import { Navigation } from "@/components/Navigation";

interface Notice {
  id: number;
  title: string;
  content: string;
}

interface PcroomDummy {
  nameOfPcroom: string;
  totalSeats: number;
  occupiedSeats: number;
  notices: Notice[];
}

interface Favorite {
  pcroomId: number;
  nameOfPcroom: string;
  utilization?: number;
  totalSeats?: number;
  occupiedSeats?: number;
}

const PcroomDetail = () => {
  const token = localStorage.getItem("jwt");
  const [loading, setLoading] = useState(true);
  const [utilization, setUtilization] = useState(0);
  const [favorites, setFavorites] = useState<Favorite[]>([]);

  const pcroomDummy: PcroomDummy = {
    nameOfPcroom: "메가PC 강남점",
    totalSeats: 36,
    occupiedSeats: 21,
    notices: [
      { id: 1, title: "11월 이벤트 안내", content: "신규 회원 2시간 무료 쿠폰 지급" },
      { id: 2, title: "야간 할인 적용", content: "밤 12시~오전 8시 30% 할인" },
      { id: 3, title: "좌석 점검 안내", content: "11월 12일 오전 9시~11시 정기 점검" },
    ],
  };

  const { nameOfPcroom, totalSeats, occupiedSeats, notices } = pcroomDummy;
  const emptySeats = totalSeats - occupiedSeats;

  /** 공통 안전 API 호출 함수 */
  const safeApiGet = async (url: string, config = {}) => {
    if (!token) return null;
    try {
      const res = await api.get(url, config);
      return res.data;
    } catch (err) {
      console.error(`GET ${url} 실패`, err);
      return null;
    }
  };

  /** 즐겨찾기 + 각 피시방 가동률 조회 */
  const fetchFavorites = async () => {
    const data = await safeApiGet("/favorites");
    if (!Array.isArray(data)) {
      setFavorites([]);
      return;
    }

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
  };

  /** 특정 피시방 실시간 가동률 조회 */
  const fetchUtilization = async () => {
    const res = await safeApiGet(`/pcrooms/1/utilization`);
    if (res) setUtilization(res.utilization ?? 0);
    else setUtilization((occupiedSeats / totalSeats) * 100);
  };

  /** 초기 데이터 로드 */
  useEffect(() => {
    const loadData = async () => {
      if (!token) {
        setLoading(false);
        return;
      }
      await fetchUtilization();
      await fetchFavorites();
      setLoading(false);
    };
    loadData();
  }, [token]);

  /** 가동률에 따른 색상 구분 */
  const utilizationColor = (() => {
    if (utilization >= 80) return "text-red-500 bg-red-500/10";
    if (utilization >= 60) return "text-orange-500 bg-orange-500/10";
    if (utilization >= 40) return "text-yellow-500 bg-yellow-500/10";
    if (utilization > 0) return "text-green-500 bg-green-500/10";
    return "text-slate-500 bg-slate-100";
  })();

  const firstFavorite = favorites[0];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 p-6">
      <Navigation />

      <main className="container mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12">
        {/* 헤더 */}
        <header className="mb-8">
          <h1 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            {firstFavorite?.nameOfPcroom ?? "PC방 상세 정보"}
          </h1>
        </header>

        {/* 통계 카드 */}
        <section className="grid grid-cols-2 gap-4 mb-6">
          <Card className={`p-4 flex flex-col justify-center ${utilizationColor}`}>
            <p className="text-sm font-medium text-muted-foreground">실시간 사용률</p>
            <p className="text-lg font-bold mt-1">
              {loading ? "..." : `${utilization.toFixed(0)}%`}
            </p>
          </Card>

          <Card className="p-4 flex flex-col justify-center">
            <p className="text-sm font-medium text-muted-foreground">총 좌석</p>
            <p className="text-lg font-bold mt-1">{totalSeats}</p>
          </Card>

          <Card className="p-4 flex flex-col justify-center">
            <p className="text-sm font-medium text-muted-foreground">사용 중</p>
            <p className="text-lg font-bold text-status-in-use mt-1">{occupiedSeats}</p>
          </Card>

          <Card className="p-4 flex flex-col justify-center">
            <p className="text-sm font-medium text-muted-foreground">빈자리</p>
            <p className="text-lg font-bold mt-1">{emptySeats}</p>
          </Card>
        </section>

        {/* 공지사항 / 좌석 배치 */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* 공지사항 */}
          <Card className="p-4">
            <CardHeader>
              <CardTitle className="text-sm font-medium text-muted-foreground">공지 사항</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <p className="text-sm text-muted-foreground">Loading...</p>
              ) : (
                <>
                  <div className="space-y-2 text-sm">
                    <p>PC방: {nameOfPcroom}</p>
                    <p>총 좌석: {totalSeats}</p>
                    <p>사용 중 좌석: {occupiedSeats}</p>
                    <p>실시간 사용률: {utilization.toFixed(0)}%</p>
                  </div>

                  <div className="mt-4 border-t border-border pt-3 space-y-3">
                    <h3 className="text-sm font-semibold">공지 목록</h3>
                    {notices.map((notice) => (
                      <div
                        key={notice.id}
                        className="border border-border rounded-md p-3 hover:bg-muted/40 transition-all"
                      >
                        <p className="font-medium text-sm">{notice.title}</p>
                        <p className="text-xs text-muted-foreground mt-1">{notice.content}</p>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* 좌석 배치도 */}
          <Card className="p-4">
            <CardHeader>
              <CardTitle className="text-sm font-medium text-muted-foreground">좌석 배치도</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-6 gap-2">
                {Array.from({ length: totalSeats }).map((_, idx) => {
                  const isOccupied = idx < occupiedSeats;
                  return (
                    <div
                      key={idx}
                      className={`aspect-square rounded-md flex items-center justify-center text-xs font-bold ${
                        isOccupied
                          ? "bg-status-in-use text-white"
                          : "bg-status-available text-white"
                      }`}
                    >
                      {idx + 1}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </section>
        <BottomNav />
      </main>
    </div>
  );
};

export default PcroomDetail;
