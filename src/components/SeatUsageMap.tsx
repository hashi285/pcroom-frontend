// src/components/SeatUsageMap.tsx
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import api from "@/api/axiosInstance";

interface SeatUsage {
  seatId: number;
  seatNum: number;
  seatsIp: string;
  x: number;
  y: number;
  usedPercent: number;
  date: string;
}

interface Seat {
  id: number;
  top: number;
  left: number;
  percent: number;
}

interface SeatUsageMapProps {
  pcroomId: number;
}

const SeatUsageMap = ({ pcroomId }: SeatUsageMapProps) => {
  const [seats, setSeats] = useState<Seat[]>([]);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState<string>(new Date().toISOString().split("T")[0]);
  const [endDate, setEndDate] = useState<string>(new Date().toISOString().split("T")[0]);

  const seatSize = 40;

  const fetchSeatUsage = async () => {
    setLoading(true);
    try {
      const res = await api.get<SeatUsage[]>(`/pcroom/seat-usage-daily/${pcroomId}/range-with-info`, {
        params: { startDate, endDate },
      });

      const formattedSeats: Seat[] = res.data.map((s) => ({
        id: s.seatNum,
        top: s.y * seatSize,
        left: s.x * seatSize,
        percent: s.usedPercent,
      }));

      setSeats(formattedSeats);
    } catch (err) {
      console.error("좌석 정보를 불러오지 못했습니다.", err);
      setSeats([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (pcroomId) fetchSeatUsage();
  }, [pcroomId, startDate, endDate]);

  const maxX = seats.length ? Math.max(...seats.map((s) => s.left)) + seatSize : 0;
  const maxY = seats.length ? Math.max(...seats.map((s) => s.top)) + seatSize : 0;

  // 좌석 가동률 색상 단계 (다크 모드 포함)
  const getSeatColor = (percent: number) => {
    const opacity = Math.min(Math.max(percent / 100, 0.1), 1); // 0.1~1 사이
    return `rgba(79, 70, 229, ${opacity})`; // #4F46E5
  };

  return (
    <Card className="shadow-subtle bg-card">
      <CardHeader className="pb-3 border-b flex flex-col md:flex-row md:items-center md:justify-between gap-2 border-zinc-200 dark:border-zinc-800">
        <CardTitle className="text-base font-semibold text-zinc-700 dark:text-zinc-300">좌석별 가동률</CardTitle>

        {/* 날짜 선택 */}
        <div className="flex gap-2 items-center">
          <label>
            시작일:
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="ml-1 border rounded px-1 py-0.5 text-sm dark:bg-zinc-800 dark:border-zinc-600 dark:text-white"
            />
          </label>
          <label>
            종료일:
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="ml-1 border rounded px-1 py-0.5 text-sm dark:bg-zinc-800 dark:border-zinc-600 dark:text-white"
            />
          </label>
          <button
            className="ml-2 px-2 py-1 bg-primary text-white rounded text-sm"
            onClick={fetchSeatUsage}
          >
            조회
          </button>
        </div>
      </CardHeader>

      <CardContent className="relative w-full h-[60vh] flex flex-col items-center justify-start">
        {/* 범례: 그라데이션 가로 바 */}
        <div className="w-full max-w-md h-4 mb-3 rounded overflow-hidden border border-zinc-300 dark:border-zinc-600">
          <div
            className="h-full w-full"
            style={{
              background: "linear-gradient(to right, rgba(79,70,229,0.1), rgba(79,70,229,1))",
            }}
          />
          <div className="flex justify-between text-xs mt-1 px-1 text-zinc-700 dark:text-zinc-300">
            <span>0%</span>
            <span>25%</span>
            <span>50%</span>
            <span>75%</span>
            <span>100%</span>
          </div>
        </div>

        {loading ? (
          <div className="text-sm text-muted-foreground">좌석 정보를 불러오는 중입니다...</div>
        ) : seats.length === 0 ? (
          <div className="text-sm text-center text-muted-foreground">선택한 날짜에 좌석 사용률 데이터가 없습니다.</div>
        ) : (
          <div className="relative overflow-auto rounded-lg border bg-zinc-50 dark:bg-zinc-900" style={{ width: "100%", height: "100%" }}>
            <div className="relative mx-auto my-auto origin-top-left" style={{ width: `${maxX}px`, height: `${maxY}px` }}>
              {seats.map((seat) => (
                <div
                  key={seat.id}
                  style={{
                    position: "absolute",
                    top: `${seat.top}px`,
                    left: `${seat.left}px`,
                    width: `${seatSize - 4}px`,
                    height: `${seatSize - 4}px`,
                    borderRadius: 4,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 10,
                    color: "#fff",
                    fontWeight: "bold",
                    backgroundColor: getSeatColor(seat.percent),
                  }}
                  title={`좌석 ${seat.id} - 가동률 ${seat.percent.toFixed(0)}%`}
                >
                  {seat.id}
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SeatUsageMap;
