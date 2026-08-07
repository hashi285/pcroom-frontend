// src/components/SeatUsageMap.tsx
import { useEffect, useState, useRef } from "react";
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
  // Note: /seat-usage-daily endpoint might not have seatType in its return.
  // We can just rely on the fallback or modify the backend.
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
  percent?: number;
  label?: string;
}

interface SeatUsageMapProps {
  pcroomId: number;
}

const SeatUsageMap = ({ pcroomId }: SeatUsageMapProps) => {
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split("T")[0];
  const weekAgo = new Date();
  weekAgo.setDate(today.getDate() - 7);
  const weekAgoStr = weekAgo.toISOString().split("T")[0];

  const [elements, setElements] = useState<CanvasElement[]>([]);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState<string>(weekAgoStr);
  const [endDate, setEndDate] = useState<string>(yesterdayStr);
  const [scale, setScale] = useState(1);
  
  const containerRef = useRef<HTMLDivElement | null>(null);
  const lastDistanceRef = useRef<number | null>(null);
  const MIN_SCALE = 0.5;
  const MAX_SCALE = 3;

  const fetchSeatUsage = async () => {
    setLoading(true);
    try {
      const [usageRes, structRes] = await Promise.all([
        api.get<SeatUsage[]>(
          `/pcroom/seat-usage-daily/${pcroomId}/range-with-info`,
          { params: { startDate, endDate } }
        ),
        api.get<Structure[]>(`/pcrooms/${pcroomId}/structures`)
      ]);

      const formattedSeats: CanvasElement[] = usageRes.data.map((s) => ({
        id: `seat-${s.seatNum}`,
        type: "SEAT",
        top: s.y,
        left: s.x,
        width: 50,
        height: 50,
        percent: s.usedPercent,
        label: String(s.seatNum),
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
    } catch (err) {
      console.error("좌석 사용률 데이터를 불러오지 못했습니다.", err);
      setElements([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (pcroomId) fetchSeatUsage();
  }, [pcroomId, startDate, endDate]);

  // 핀치 줌 로직
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

  const getElementColor = (type: string, percent?: number, seatType?: string) => {
    if (type === "SEAT" && percent !== undefined) {
      const t = percent / 100;
      let start = [229, 231, 235]; // 회색
      const mid = [129, 140, 248]; // 연보라
      const end = [79, 70, 229]; // 짙은보라
      
      // Customize base color by seat type if needed, but gradient logic remains the same.
      // For now, usage percent gradient overrides the seat type color.
      
      let r, g, b;
      if (t <= 0.5) {
        const k = t / 0.5;
        r = start[0] + (mid[0] - start[0]) * k;
        g = start[1] + (mid[1] - start[1]) * k;
        b = start[2] + (mid[2] - start[2]) * k;
      } else {
        const k = (t - 0.5) / 0.5;
        r = mid[0] + (end[0] - mid[0]) * k;
        g = mid[1] + (end[1] - mid[1]) * k;
        b = mid[2] + (end[2] - mid[2]) * k;
      }
      return `rgb(${r}, ${g}, ${b})`;
    }
    
    switch (type) {
      case "WALL": return "#3f3f46"; // zinc-700
      case "TOILET": return "#06b6d4"; // cyan-500
      case "COUNTER": return "#f59e0b"; // amber-500
      case "SMOKING_ROOM": return "#f87171"; // red-400
      default: return "#a1a1aa"; // zinc-400
    }
  };

  return (
    <Card className="shadow-subtle bg-card">
      <CardHeader className="pb-3 border-b flex flex-col md:flex-row md:items-center md:justify-between gap-2 border-zinc-200 dark:border-zinc-800">
        <CardTitle className="text-base font-semibold text-zinc-700 dark:text-zinc-300">
          좌석별 가동률 (자유 배치)
        </CardTitle>

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
        </div>
      </CardHeader>

      <CardContent className="relative w-full h-[80vh] flex flex-col items-center justify-start mt-4">
        <div className="w-full max-w-md h-4 mb-3 rounded overflow-hidden border border-zinc-300 dark:border-zinc-600">
          <div
            className="h-full w-full"
            style={{
              background: "linear-gradient(to right, rgba(229,231,235,1), rgba(79,70,229,1))",
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
        ) : elements.length === 0 ? (
          <div className="text-sm text-center text-muted-foreground">
            선택한 날짜에 표시할 데이터가 없습니다.
          </div>
        ) : (
          <div
            ref={containerRef}
            className="relative overflow-auto rounded-lg border bg-zinc-50 dark:bg-zinc-900 w-full"
            style={{ height: "calc(100% - 40px)" }}
          >
            <div
              className="relative mx-auto my-auto origin-top-left transition-transform duration-150"
              style={{
                width: `${maxX}px`,
                height: `${maxY}px`,
                transform: `scale(${scale})`
              }}
            >
              {elements.map((el) => (
                <div
                  key={el.id}
                  style={{
                    position: "absolute",
                    top: `${el.top}px`,
                    left: `${el.left}px`,
                    width: `${el.width}px`,
                    height: `${el.height}px`,
                    borderRadius: 4,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 10,
                    color: "#fff",
                    fontWeight: "bold",
                    backgroundColor: getElementColor(el.type, el.percent),
                    border: el.type === "SEAT" ? "1px solid rgba(0,0,0,0.15)" : (el.type === "WALL" ? "2px solid #18181b" : "none"),
                  }}
                  title={el.type === "SEAT" ? `좌석 ${el.label} - 가동률 ${el.percent?.toFixed(0)}%` : el.label}
                >
                  {el.type === "SEAT" ? el.label : el.label}
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
