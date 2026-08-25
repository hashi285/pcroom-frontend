import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import api from "@/api/axiosInstance";
import { BottomNav } from "@/components/BottomNav";
import { Navigation } from "@/components/Navigation";
import PcroomSeatMap from "@/components/PcroomSeatMap";
import { usePcroomInfo, usePcroomUtilization, usePcroomNotices, useFavorites } from "@/hooks/queries";

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
  const navigate = useNavigate();
  const token = localStorage.getItem("jwt");
  const { id } = useParams<{ id: string }>();
  const pcroomId = Number(id);

  const { data: pcroomInfo, isLoading: isInfoLoading } = usePcroomInfo(pcroomId);
  const { data: utilizationData, isLoading: isUtilLoading } = usePcroomUtilization(pcroomId);
  const { data: noticesData = [], isLoading: isNoticesLoading } = usePcroomNotices(pcroomId);
  const { data: favoritesData = [] } = useFavorites();

  const loading = isInfoLoading || isUtilLoading || isNoticesLoading;

  const nameOfPcroom = pcroomInfo?.nameOfPcroom ?? "이름 없음";
  const utilization = utilizationData?.utilization ?? 0;
  const totalSeats = utilizationData?.seatCount ?? pcroomInfo?.seatCount ?? 0;
  const occupiedSeats = utilizationData?.usedSeatCount ?? 0;
  const emptySeats = totalSeats - occupiedSeats;
  const notices = noticesData;
  const favorites = favoritesData;

  useEffect(() => {
    if (!token) navigate("/auth");
  }, [token, navigate]);

  /** 가동률 색상 계산 */
  const utilizationColor = (() => {
    if (utilization >= 80) return "text-red-500 bg-red-500/10";
    if (utilization >= 60) return "text-orange-500 bg-orange-500/10";
    if (utilization >= 40) return "text-yellow-500 bg-yellow-500/10";
    if (utilization > 0) return "text-green-500 bg-green-500/10";
    return "text-slate-500 bg-slate-100";
  })();

  return (
    <div className="min-h-screen bg-white/90 dark:bg-zinc-900/90 backdrop-blur-sm transition-colors">
      <Navigation />

      <main className="container mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16">
        {/* 제목 영역 */}
        <header className="mb-8">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
            {nameOfPcroom || "피시방 정보"}
          </h1>
        </header>

        {/* 요약 카드 */}
        <section className="grid grid-cols-2 gap-4 mb-8">
          <Card className={`p-4 flex flex-col justify-center ${utilizationColor}`}>
            <p className="text-sm font-medium text-muted-foreground">실시간 사용률</p>
            <p className="text-lg font-bold mt-1">
              {loading ? "..." : `${utilization.toFixed(0)}%`}
            </p>
          </Card>

          <Card className="p-4 flex flex-col justify-center bg-white/80 dark:bg-zinc-800/80 border border-border">
            <p className="text-sm font-medium text-muted-foreground">총 좌석</p>
            <p className="text-lg font-bold mt-1">{totalSeats || "-"}</p>
          </Card>

          <Card className="p-4 flex flex-col justify-center bg-white/80 dark:bg-zinc-800/80 border border-border">
            <p className="text-sm font-medium text-muted-foreground">사용 중</p>
            <p className="text-lg font-bold text-emerald-500 mt-1">{occupiedSeats}</p>
          </Card>

          <Card className="p-4 flex flex-col justify-center bg-white/80 dark:bg-zinc-800/80 border border-border">
            <p className="text-sm font-medium text-muted-foreground">빈자리</p>
            <p className="text-lg font-bold mt-1">{emptySeats >= 0 ? emptySeats : "-"}</p>
          </Card>
        </section>

        {/* 공지사항 + 좌석맵 */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* 공지사항 */}
          <Card className="p-4 bg-white/80 dark:bg-zinc-800/80 border border-border rounded-xl shadow-sm">
            <CardHeader>
              <CardTitle className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
                공지 사항
              </CardTitle>
            </CardHeader>

            <CardContent>
              {loading ? (
                <p className="text-sm text-muted-foreground">공지사항을 불러오는 중...</p>
              ) : notices.length === 0 ? (
                <p className="text-sm text-muted-foreground">등록된 공지사항이 없습니다.</p>
              ) : (
                <div className="mt-2 flex flex-col gap-3">
                  {notices.map((notice) => (
                    <button
                      key={notice.id}
                      onClick={() => navigate(`/notice/${notice.id}`)}
                      className="text-left border border-border rounded-lg p-3 hover:bg-muted/50 transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                    >
                      <p className="font-medium text-sm text-foreground">{notice.title}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(notice.creationDate).toLocaleString("ko-KR", {
                          year: "numeric",
                          month: "2-digit",
                          day: "2-digit",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </button>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* 좌석 배치도 */}
          <PcroomSeatMap pcroomId={pcroomId} />
        </section>

        <BottomNav />
      </main>
    </div>
  );
};

export default PcroomDetail;
