// src/components/PcroomSeatMap.tsx
import { useEffect, useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import api from "@/api/axiosInstance";

interface SeatInfo {
  pcroomId: string;
  seatsNum: number;
  x: number;
  y: number;
  seatType: "NORMAL" | "COUPLE" | "TEAM";
}

interface SeatStatus {
  seatsNum: number;
  result: boolean;
}

interface Structure {
  type: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

interface CanvasElement {
  id: string;
  type: string;
  top: number;
  left: number;
  width: number;
  height: number;
  status?: "occupied" | "available";
  label?: string;
  seatType?: "NORMAL" | "COUPLE" | "TEAM";
}

const PcroomSeatMap = ({ pcroomId }: { pcroomId: number }) => {
  const [elements, setElements] = useState<CanvasElement[]>([]);
  const [loading, setLoading] = useState(true);
  const [scale, setScale] = useState(1);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const MIN_SCALE = 0.5;
  const MAX_SCALE = 3;
  const lastDistanceRef = useRef<number | null>(null);

  useEffect(() => {
    const loadSeatData = async () => {
      try {
        const [seatRes, statusRes, structRes] = await Promise.all([
          api.get<SeatInfo[]>(`/pcrooms/seatInfo/${pcroomId}`),
          api.get<SeatStatus[]>(`/pcrooms/${pcroomId}/seat`),
          api.get<Structure[]>(`/pcrooms/${pcroomId}/structures`),
        ]);

        const statusMap = new Map<number, boolean>();
        statusRes.data.forEach((s) => statusMap.set(s.seatsNum, s.result));

        const formattedSeats: CanvasElement[] = seatRes.data.map((seat) => ({
          id: `seat-${seat.seatsNum}`,
          type: "SEAT",
          top: seat.y,
          left: seat.x,
          width: 50,
          height: 50,
          status: statusMap.get(seat.seatsNum) ? "occupied" : "available",
          label: seat.seatType === "COUPLE" ? "커플석" : (seat.seatType === "TEAM" ? "팀좌석" : String(seat.seatsNum)),
          seatType: seat.seatType,
        }));

        const formattedStructures: CanvasElement[] = structRes.data.map((s, i) => ({
          id: `struct-${i}`,
          type: s.type,
          top: s.y,
          left: s.x,
          width: s.width,
          height: s.height,
          label: s.type,
        }));

        setElements([...formattedSeats, ...formattedStructures]);
      } catch (error) {
        console.error("도면 정보를 불러오지 못했습니다.", error);
      } finally {
        setLoading(false);
      }
    };

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
        e.preventDefault();
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

  const maxX = elements.length ? Math.max(...elements.map((s) => s.left + s.width)) + 100 : 800;
  const maxY = elements.length ? Math.max(...elements.map((s) => s.top + s.height)) + 100 : 600;

  const getElementColor = (type: string, status?: string, seatType?: string) => {
    if (type === "SEAT") {
      return status === "occupied" ? "bg-blue-500 text-white border border-blue-600/50" : "bg-zinc-400 text-white border border-zinc-500/50";
    }
    switch (type) {
      case "WALL": return "bg-zinc-700 text-white border-2 border-zinc-900";
      case "TOILET": return "bg-cyan-500 text-white";
      case "COUNTER": return "bg-amber-500 text-white";
      case "SMOKING_ROOM": return "bg-red-400 text-white";
      default: return "bg-zinc-400 text-white";
    }
  };

  return (
    <Card className="relative w-full h-[80vh] max-w-6xl mx-auto p-4 bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 shadow-md">
      <CardHeader className="pb-3 border-b border-zinc-200 dark:border-zinc-800">
        <CardTitle className="text-base font-semibold text-zinc-700 dark:text-zinc-300">
          좌석 배치도 (자유 배치)
        </CardTitle>
      </CardHeader>

      <CardContent className="relative w-full h-[calc(80vh-80px)] flex items-center justify-center">
        {loading ? (
          <div className="text-sm text-muted-foreground">도면 정보를 불러오는 중입니다...</div>
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
              {elements.map((el) => (
                <div
                  key={el.id}
                  className={`absolute flex items-center justify-center text-xs font-bold rounded-md transition-colors duration-150 ${getElementColor(el.type, el.status, el.seatType)}`}
                  style={{
                    top: `${el.top}px`,
                    left: `${el.left}px`,
                    width: `${el.width}px`,
                    height: `${el.height}px`,
                  }}
                >
                  {el.label}
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
