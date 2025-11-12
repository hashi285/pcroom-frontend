// src/components/PcroomDashboardLayout.tsx
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import api from "@/api/axiosInstance";
import { BottomNav } from "@/components/BottomNav";
import { Navigation } from "@/components/Navigation";
import PcroomSeatMap from "@/components/PcroomSeatMap";



interface Notice {
  id: number;
  title: string;
  creationDate: string;
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
  const { id } = useParams<{ id: string }>();
  const pcroomId = Number(id);

  const [loading, setLoading] = useState(true);
  const [utilization, setUtilization] = useState(0);
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [notices, setNotices] = useState<Notice[]>([]);

  // ✅ 피시방 기본 정보 (서버로부터 갱신)
  const [nameOfPcroom, setNameOfPcroom] = useState("");
  const [totalSeats, setTotalSeats] = useState(0);
  const [occupiedSeats, setOccupiedSeats] = useState(0);

  const emptySeats = totalSeats - occupiedSeats;

  /** 공통 안전 API 호출 */
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

  /** ✅ 피시방 기본 정보 조회 */
  const fetchPcroomInfo = async () => {
    if (!pcroomId) return;
    const res = await safeApiGet(`/pcrooms/pcroomInfo/${pcroomId}`);
    if (res) {
      setNameOfPcroom(res.nameOfPcroom ?? "피시방 이름 없음");
      setTotalSeats(res.seatCount ?? 0);
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

  /** 특정 피시방 가동률 조회 */
  const fetchUtilization = async () => {
    if (!pcroomId) return;
    const res = await safeApiGet(`/pcrooms/${pcroomId}/utilization`);
    if (res) {
      setUtilization(res.utilization ?? 0);
      setTotalSeats(res.totalSeats ?? totalSeats);
      setOccupiedSeats(res.occupiedSeats ?? 0);
    } else {
      setUtilization((occupiedSeats / totalSeats) * 100);
    }
  };

  /** 공지사항 목록 조회 */
  const fetchNotices = async () => {
    if (!pcroomId) return;
    const res = await safeApiGet(`/notices/${pcroomId}`);
    if (Array.isArray(res)) {
      setNotices(res);
    } else {
      setNotices([]);
    }
  };

  /** 초기 데이터 로드 */
  useEffect(() => {
    const loadData = async () => {
      if (!token || !pcroomId) {
        setLoading(false);
        return;
      }
      await Promise.all([
        fetchPcroomInfo(), // ✅ 피시방 기본 정보 추가
        fetchUtilization(),
        fetchFavorites(),
        fetchNotices(),
      ]);
      setLoading(false);
    };
    loadData();
  }, [token, pcroomId]);

  /** 좌석 정보 (임시 하드코딩) */
  const seats = [
    { id: 1, top: "5%", left: "5%", status: "occupied" },
    { id: 2, top: "5%", left: "10%", status: "available" },
    { id: 3, top: "5%", left: "15%", status: "occupied" },
    { id: 4, top: "5%", left: "20%", status: "occupied" },
    { id: 5, top: "5%", left: "25%", status: "occupied" },
  ];

  /** 가동률 색상 */
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
        <header className="mb-8">
          <h1 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            {nameOfPcroom || firstFavorite?.nameOfPcroom || "피시방 이름 로딩중..."}
          </h1>
        </header>

        <section className="grid grid-cols-2 gap-4 mb-6">
          <Card className={`p-4 flex flex-col justify-center ${utilizationColor}`}>
            <p className="text-sm font-medium text-muted-foreground">실시간 사용률</p>
            <p className="text-lg font-bold mt-1">
              {loading ? "..." : `${utilization.toFixed(0)}%`}
            </p>
          </Card>

          <Card className="p-4 flex flex-col justify-center">
            <p className="text-sm font-medium text-muted-foreground">총 좌석</p>
            <p className="text-lg font-bold mt-1">{loading ? "..." : totalSeats}</p>
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

        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* 공지사항 카드 */}
          <Card className="p-4">
            <CardHeader>
              <CardTitle className="text-sm font-medium text-muted-foreground">공지 사항</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <p className="text-sm text-muted-foreground">Loading...</p>
              ) : notices.length === 0 ? (
                <p className="text-sm text-muted-foreground">등록된 공지사항이 없습니다.</p>
              ) : (
                <div className="mt-2 border-t border-border pt-3 space-y-3">
                  {notices.map((notice) => (
                    <div
                      key={notice.id}
                      className="border border-border rounded-md p-3 hover:bg-muted/40 transition-all"
                    >
                      <p className="font-medium text-sm">{notice.title}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(notice.creationDate).toLocaleString("ko-KR", {
                          year: "numeric",
                          month: "2-digit",
                          day: "2-digit",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* 좌석 배치도 */}
          <PcroomSeatMap />

        </section>

        <BottomNav />
      </main>
    </div>
  );
};

export default PcroomDetail;
