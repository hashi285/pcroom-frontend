// src/pages/Notices.tsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Mail, Calendar } from "lucide-react";
import api from "@/api/axiosInstance";
import { BottomNav } from "@/components/BottomNav";
import { Navigation } from "@/components/Navigation";

interface FavoritePcroom {
  pcroomId: number;
  nameOfPcroom: string;
}

interface Notice {
  id: number;
  title: string;
  creationDate: string;
}

const Notices = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem("jwt");

  const [pcroomId, setPcroomId] = useState<number | null>(null);
  const [pcroomName, setPcroomName] = useState<string>("");
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFavoritePcroom = async () => {
      if (!token) return;
      try {
        const res = await api.get(`/favorites?partySize=1`);
        if (res.data && res.data.length > 0) {
          setPcroomId(res.data[0].pcroomId);
          setPcroomName(res.data[0].nameOfPcroom);
        } else {
          setLoading(false);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchFavoritePcroom();
  }, [token]);

  useEffect(() => {
    if (pcroomId === null || !token) {
        if (pcroomId === null && !loading) {
            // Already loaded but no favorite
        }
        return;
    }
    const fetchNotices = async () => {
      try {
        const res = await api.get(`/notices/${pcroomId}`);
        if (Array.isArray(res.data)) setNotices(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchNotices();
  }, [pcroomId, token, loading]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 p-6">
      <Navigation />
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12">
        <div className="max-w-5xl mx-auto animate-fade-in">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2 bg-gradient-primary bg-clip-text text-transparent">
              공지사항
            </h1>

            {pcroomName && (
              <p className="text-sm text-muted-foreground">
                {pcroomName} 공지사항을 불러왔습니다.
              </p>
            )}
          </div>

          <Card className="shadow-subtle bg-gradient-card border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="w-5 h-5 text-primary" />
                <CardDescription>최신 공지사항</CardDescription>
              </CardTitle>
            </CardHeader>

            <CardContent>
              {loading ? (
                <p className="text-muted-foreground text-sm">Loading...</p>
              ) : notices.length === 0 ? (
                <p className="text-muted-foreground text-sm">등록된 공지가 없습니다.</p>
              ) : (
                <div className="flex flex-col gap-4">
                  {notices.map((notice) => (
                    <Card
                      key={notice.id}
                      onClick={() => navigate(`/notice/${notice.id}`)}
                      className="p-4 shadow-subtle hover:shadow-elegant transition-all duration-300 border border-border cursor-pointer"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <p className="font-semibold text-lg text-slate-900 dark:text-white">
                            {notice.title}
                          </p>

                          <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                            <Calendar className="w-4 h-4 text-muted-foreground" />
                            <span>
                              {new Date(notice.creationDate).toLocaleDateString("ko-KR")}
                            </span>
                          </div>
                        </div>

                        <span className="material-symbols-outlined text-slate-400 dark:text-slate-500">
                          chevron_right
                        </span>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
      <BottomNav />
    </div>
  );
};

export default Notices;
