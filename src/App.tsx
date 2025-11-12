// src/App.tsx
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import { ProtectedRoute } from "@/components/ProtectedRoute";
import { UserProvider } from "@/context/UserProvider"; // UserProvider 추가

import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import ManagerDashboard from "./pages/ManagerDashboard";
import PcroomForm from "./pages/PcroomForm";
import NotFound from "./pages/NotFound";
import PcroomSearch from "./pages/PcroomSearch";
import Notices from "./pages/Notices";
import PcroomDetail from "./pages/PcroomDetail";
import UserSettings from "./pages/UserSettings";
import NoticeDetailPage from "@/pages/NoticeDetailPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <UserProvider> {/* UserProvider로 앱 전체 감싸기 */}
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />

            {/* 일반 유저 대시보드 */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />

            {/* 관리자 전용 대시보드 */}
            <Route
              path="/manager-dashboard"
              element={
                <ProtectedRoute>
                  <ManagerDashboard />
                </ProtectedRoute>
              }
            />

            {/* 관리자 전용 피시방 등록 페이지 */}
            <Route
              path="/manager-dashboard/pcroom-form"
              element={
                <ProtectedRoute>
                  <PcroomForm />
                </ProtectedRoute>
              }
            />
            {/* 피시방 검색 페이지 */}
            <Route
              path="/search"
              element={
                <ProtectedRoute>
                  <PcroomSearch />
                </ProtectedRoute>
              }
            />

            {/* 공지사항 페이지 */}
            <Route
              path="/notices"
              element={
                <ProtectedRoute>
                  <Notices />
                </ProtectedRoute>
              }
            />

            <Route
              path="/pcroom/:id"
              element={
                <ProtectedRoute>
                  <PcroomDetail />
                </ProtectedRoute>
              }
            />

            <Route
              path="/settings"
              element={
                <ProtectedRoute>
                  <UserSettings />
                </ProtectedRoute>
              }
            />

            <Route
              path="/notice/:noticeId"
              element={<NoticeDetailPage />
              }
            />

            {/* Catch-all 404 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </UserProvider>
  </QueryClientProvider>
);

export default App;
