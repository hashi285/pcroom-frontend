import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import api from "@/api/axiosInstance";
import {
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Navigation } from "@/components/Navigation";
import { BottomNav } from "@/components/BottomNav";


interface UtilizationRecord {
  pcroomId: number;
  utilization: number;
  recordedAt: string;
  nameOfPcroom?: string;
}

const CompetitorUtilizationDetail = () => {
  const [data, setData] = useState<UtilizationRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // URLSearchParams로 pcroomId 가져오기 (선택적)
  const searchParams = new URLSearchParams(location.search);
  const pcroomId = searchParams.get("pcroomId");

  const fetchHistory = async () => {
    try {
      const url = `/manager-favorites/detail?hours=24${pcroomId ? `&pcroomId=${pcroomId}` : ""}`;
      const res = await api.get(url);
      setData(res.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const jwt = localStorage.getItem("jwt");
    if (!jwt) {
      navigate("/auth", { replace: true });
      return;
    }
    fetchHistory();
  }, [pcroomId, navigate]);

  const formattedData = data
    .slice()
    .sort((a, b) => new Date(a.recordedAt).getTime() - new Date(b.recordedAt).getTime())
    .map((item) => ({
      ...item,
      time: new Date(item.recordedAt).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      date: new Date(item.recordedAt).toLocaleDateString(),
    }));

  const last = formattedData[formattedData.length - 1];
  const prev = formattedData[formattedData.length - 2];
  const diff = last && prev ? (last.utilization - prev.utilization).toFixed(2) : "0";

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <Navigation />

      <main className="container mx-auto px-4 py-24">
        <button className="mb-4 text-sm underline" onClick={() => navigate(-1)}>
          뒤로가기
        </button>

        <Card className="shadow-subtle bg-card">
          <CardHeader>
            <CardTitle className="text-xl font-semibold">시간대별 가동률 변화</CardTitle>
          </CardHeader>

          <CardContent>
            {loading ? (
              <div className="py-10 text-center">Loading...</div>
            ) : (
              <>
                {/* 주요 수치 */}
                <div className="mb-6">
                  <p className="text-lg font-medium">
                    {last?.nameOfPcroom} 현재 가동률: {last?.utilization.toFixed(2)}%
                  </p>
                  <p className={`text-sm mt-1 ${Number(diff) >= 0 ? "text-green-600" : "text-red-600"}`}>
                    변화: {diff}%
                  </p>
                </div>

                {/* 그래프 (기존처럼 단일 색상, 시간만 표시) */}
                <div className="w-full h-72 mb-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={formattedData}>
                      <defs>
                        <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.4} />
                          <stop offset="95%" stopColor="#4F46E5" stopOpacity={0} />
                        </linearGradient>
                      </defs>

                      <XAxis dataKey="time" tick={{ fontSize: 12 }} />
                      <YAxis domain={[0, 100]} />
                      <Tooltip />
                      <Area type="monotone" dataKey="utilization" stroke="#4F46E5" fill="url(#colorUv)" strokeWidth={3} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>

                {/* 상세 리스트 접기/펼치기 */}
                <button
                  className="mb-2 text-sm underline"
                  onClick={() => setExpanded(!expanded)}
                >
                  {expanded ? "리스트 접기" : "리스트 펼치기"}
                </button>

                {expanded && (
                  <div className="mt-2 max-h-96 overflow-auto border border-border rounded-md">
                    <table className="w-full border-collapse text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="py-2 text-left">날짜</th>
                          <th className="py-2 text-left">시간</th>
                          <th className="py-2 text-right">가동률 (%)</th>
                        </tr>
                      </thead>

                      <tbody>
                        {formattedData.map((row, idx) => (
                          <tr key={idx} className="border-b">
                            <td className="py-2">{row.date}</td>
                            <td className="py-2">{row.time}</td>
                            <td className="py-2 text-right">{row.utilization.toFixed(2)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
        <BottomNav />
      </main>
    </div>
  );
};

export default CompetitorUtilizationDetail;
