// src/pages/Notices.tsx
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Mail, Calendar } from "lucide-react";
import { BottomNav } from "@/components/BottomNav";

interface Notice {
  id: number;
  title: string;
  content: string;
  date: string;
}

const dummyNotices: Notice[] = [
  { id: 1, title: "공지사항 1", content: "첫 번째 공지사항 내용입니다.", date: "2025-11-09" },
  { id: 2, title: "공지사항 2", content: "두 번째 공지사항 내용입니다.", date: "2025-11-08" },
];

const Notices = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 p-6">
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12">
        <div className="max-w-5xl mx-auto animate-fade-in">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2 bg-gradient-primary bg-clip-text text-transparent">
              공지사항
            </h1>
          </div>

          <Card className="shadow-subtle bg-gradient-card border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="w-5 h-5 text-primary" />
                <CardDescription>최신 공지사항</CardDescription>
              </CardTitle>
              
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-4">
                {dummyNotices.map((notice) => (
                  <Card
                    key={notice.id}
                    className="p-4 shadow-subtle hover:shadow-elegant transition-all duration-300 border border-border cursor-pointer"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="font-semibold text-lg text-slate-900 dark:text-white">
                          {notice.title}
                        </p>
                        <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                          <Calendar className="w-4 h-4 text-muted-foreground" />
                          <span>{notice.date}</span>
                        </div>
                        <p className="text-sm text-muted-foreground mt-2">{notice.content}</p>
                      </div>
                      <span className="material-symbols-outlined text-slate-400 dark:text-slate-500">
                        chevron_right
                      </span>
                    </div>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      <BottomNav />
    </div>
  );
};

export default Notices;
