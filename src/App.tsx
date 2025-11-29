// src/App.tsx
import { Suspense, lazy } from "react";

import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import { ProtectedRoute } from "@/components/ProtectedRoute";
import { UserProvider } from "@/context/UserProvider";

const queryClient = new QueryClient();

// Lazy load pages
const Index = lazy(() => import("./pages/Index"));
const Auth = lazy(() => import("./pages/Auth"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const ManagerDashboard = lazy(() => import("./pages/ManagerDashboard"));
const PcroomForm = lazy(() => import("./pages/PcroomForm"));
const PcroomSearch = lazy(() => import("./pages/PcroomSearch"));
const PcroomDetail = lazy(() => import("./pages/PcroomDetail"));
const Notices = lazy(() => import("./pages/Notices"));
const NoticeDetailPage = lazy(() => import("./pages/NoticeDetailPage"));
const UserSettings = lazy(() => import("./pages/UserSettings"));
const CompetitorUtilizationDetail = lazy(() => import("./pages/CompetitorUtilizationDetail"));
const NotFound = lazy(() => import("./pages/NotFound"));

const App = () => (
  <QueryClientProvider client={queryClient}>
    <UserProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          {/* Suspense로 lazy component fallback 처리 */}
          <Suspense fallback={<div>Loading...</div>}>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<Auth />} />

              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/manager-dashboard"
                element={
                  <ProtectedRoute>
                    <ManagerDashboard />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/manager-dashboard/pcroom-form"
                element={
                  <ProtectedRoute>
                    <PcroomForm />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/search"
                element={
                  <ProtectedRoute>
                    <PcroomSearch />
                  </ProtectedRoute>
                }
              />

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

              <Route path="/notice/:noticeId" element={<NoticeDetailPage />} />

              <Route
                path="/manager-dashboard/utilization/:pcroomId"
                element={<CompetitorUtilizationDetail />}
              />

              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </TooltipProvider>
    </UserProvider>
  </QueryClientProvider>
);

export default App;
