// src/components/PcroomSeatMap.tsx
import { useEffect, useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import api from "@/api/axiosInstance";

interface SeatInfo {
  pcroomId: string;
  seatsNum: number;
  x: number;
  y: number;
}

interface SeatStatus {
  seatsNum: number;
  result: boolean;
}

interface Seat {
  id: number;
  top: number;
  left: number;
  status: "occupied" | "available";
}

const PcroomSeatMap = ({ pcroomId }: { pcroomId: number }) => {
  const [seats, setSeats] = useState<Seat[]>([]);
  const [loading, setLoading] = useState(true);
  const [scale, setScale] = useState(1);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const seatSize = 40;
  const MIN_SCALE = 0.5;
  const MAX_SCALE = 3;

  const lastDistanceRef = useRef<number | null>(null);

  const loadSeatData = async () => {
    try {
      const seatRes = await api.get<SeatInfo[]>(`/pcrooms/seatInfo/${pcroomId}`);
      const statusRes = await api.get<SeatStatus[]>(`/pcrooms/${pcroomId}/seat`);
      const statusMap = new Map<number, boolean>();
      statusRes.data.forEach((s) => statusMap.set(s.seatsNum, s.result));

      const formattedSeats: Seat[] = seatRes.data.map((seat) => ({
        id: seat.seatsNum,
        top: seat.y * seatSize,
        left: seat.x * seatSize,
        status: statusMap.get(seat.seatsNum) ? "occupied" : "available",
      }));

      setSeats(formattedSeats);
    } catch (error) {
      console.error("좌석 정보를 불러오지 못했습니다.", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (pcroomId) loadSeatData();
  }, [pcroomId]);

  // ---- 핀치 줌 이벤트 ----
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        lastDistanceRef.current = Math.sqrt(dx * dx + dy * dy);
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 2 && lastDistanceRef.current != null) {
        e.preventDefault(); // 필수: 브라우저 기본 줌 막기
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        const distance = Math.sqrt(dx * dx + dy * dy);

        const scaleFactor = distance / lastDistanceRef.current;
        setScale((prev) => Math.min(Math.max(prev * scaleFactor, MIN_SCALE), MAX_SCALE));

        lastDistanceRef.current = distance;
      }
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (e.touches.length < 2) {
        lastDistanceRef.current = null;
      }
    };

    container.addEventListener("touchstart", handleTouchStart, { passive: false });
    container.addEventListener("touchmove", handleTouchMove, { passive: false });
    container.addEventListener("touchend", handleTouchEnd, { passive: false });
    container.addEventListener("touchcancel", handleTouchEnd, { passive: false });

    return () => {
      container.removeEventListener("touchstart", handleTouchStart);
      container.removeEventListener("touchmove", handleTouchMove);
      container.removeEventListener("touchend", handleTouchEnd);
      container.removeEventListener("touchcancel", handleTouchEnd);
    };
  }, []);

  const maxX = seats.length ? Math.max(...seats.map((s) => s.left)) + seatSize : 0;
  const maxY = seats.length ? Math.max(...seats.map((s) => s.top)) + seatSize : 0;

  return (
    <Card className="relative w-full h-[80vh] max-w-6xl mx-auto p-4 bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 shadow-md">
      <CardHeader className="pb-3 border-b border-zinc-200 dark:border-zinc-800">
        <CardTitle className="text-base font-semibold text-zinc-700 dark:text-zinc-300">
          좌석 배치도
        </CardTitle>
      </CardHeader>

      <CardContent className="relative w-full h-[calc(80vh-80px)] flex items-center justify-center">
        {loading ? (
          <div className="text-sm text-muted-foreground">좌석 정보를 불러오는 중입니다...</div>
        ) : (
          <div
            ref={containerRef}
            className="relative overflow-auto rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900"
            style={{ width: "100%", height: "100%" }}
          >
            <div
              className="relative mx-auto my-auto origin-top-left transition-transform duration-150"
              style={{
                width: `${maxX}px`,
                height: `${maxY}px`,
                transform: `scale(${scale})`,
              }}
            >
              {seats.map((seat) => (
                <div
                  key={seat.id}
                  className={`absolute flex items-center justify-center text-xs font-bold rounded-md shadow-sm transition-colors duration-150 ${
                    seat.status === "occupied"
                      ? "bg-blue-500 text-white"
                      : "bg-zinc-400 text-white"
                  }`}
                  style={{
                    top: `${seat.top}px`,
                    left: `${seat.left}px`,
                    width: `${seatSize - 4}px`,
                    height: `${seatSize - 4}px`,
                  }}
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

export default PcroomSeatMap;
