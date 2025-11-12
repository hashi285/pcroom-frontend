import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import api from "@/api/axiosInstance";
import { Navigation } from "@/components/Navigation";
import { BottomNav } from "@/components/BottomNav";

interface NoticeDetail {
  id: number;
  title: string;
  content: string;
  creationDate: string;
}

const NoticeDetailPage = () => {
  const { noticeId } = useParams<{ noticeId: string }>();
  const navigate = useNavigate();
  const token = localStorage.getItem("jwt");

  const [notice, setNotice] = useState<NoticeDetail | null>(null);
  const [loading, setLoading] = useState(true);

  /** 공통 안전 API 호출 */
  const safeApiGet = async (url: string) => {
    if (!token) return null;
    try {
      const res = await api.get(url);
      return res.data;
    } catch (err) {
      console.error(`GET ${url} 실패`, err);
      return null;
    }
  };

  /** 공지사항 상세 조회 */
  const fetchNoticeDetail = async () => {
    if (!noticeId) return;
    const res = await safeApiGet(`/notices/notice/${noticeId}`);
    if (res) setNotice(res);
    setLoading(false);
  };

  useEffect(() => {
    fetchNoticeDetail();
  }, [noticeId]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 p-6">
      <Navigation />

      <main className="container mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12">
        <header className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            공지사항
          </h1>
          <button
            onClick={() => navigate(-1)}
            className="text-sm text-muted-foreground hover:text-foreground transition"
          >
            뒤로가기
          </button>
        </header>

        <Card className="p-6 shadow-md">
          {loading ? (
            <p className="text-muted-foreground text-sm">Loading...</p>
          ) : notice ? (
            <>
              <CardHeader>
                <CardTitle className="text-xl font-bold">{notice.title}</CardTitle>
                <p className="text-xs text-muted-foreground mt-1">
                  {new Date(notice.creationDate).toLocaleString("ko-KR", {
                    year: "numeric",
                    month: "2-digit",
                    day: "2-digit",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </CardHeader>
              <CardContent className="mt-4">
                <div className="text-sm leading-relaxed whitespace-pre-wrap">
                  {notice.content}
                </div>
              </CardContent>
            </>
          ) : (
            <p className="text-muted-foreground text-sm">
              공지사항 정보를 불러오지 못했습니다.
            </p>
          )}
        </Card>

        <BottomNav />
      </main>
    </div>
  );
};

export default NoticeDetailPage;
