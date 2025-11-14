// src/components/BottomNav.tsx
import { Link, useLocation } from "react-router-dom";
import { Home, Search, Mail, User, Settings } from "lucide-react";
import { useUser } from "@/context/UserProvider";
import cn from "classnames";

type NavItem = {
  to: string;
  label: string;
  icon: JSX.Element;
  id: string;
  show?: boolean;
};

export const BottomNav = () => {
  const { user } = useUser();
  const location = useLocation();

  // role 매핑: USER/ADMIN (UserProvider에서 가져오는 값에 맞춰 조정)
  const isAdmin = user?.role === "ADMIN";

  const homePath = "/dashboard";

  const items: NavItem[] = [
    { id: "home", to: homePath, label: "홈", icon: <Home size={20} />, show: true },
    { id: "search", to: "/search", label: "검색", icon: <Search size={20} />, show: true },
    { id: "notices", to: "/notices", label: "공지사항", icon: <Mail size={20} />, show: true },
    { id: "settings", to: "/settings", label: "내정보", icon: <User size={20} />, show: true },
    // 관리자 전용 설정
    { id: "admin", to: "/manager-dashboard", label: "설정", icon: <Settings size={20} />, show: isAdmin },
  ];

  return (
    <nav
      aria-label="주요 네비게이션"
      className="fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-md border-t border-border"
    >
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <ul className="flex items-center justify-between h-14">
          {items
            .filter((it) => it.show !== false)
            .map((it) => {
              const active = location.pathname === it.to || location.pathname.startsWith(it.to + "/");
              return (
                <li key={it.id} className="flex-1">
                  <Link
                    to={it.to}
                    aria-current={active ? "page" : undefined}
                    aria-label={it.label}
                    className={cn(
                      "flex flex-col items-center justify-center gap-1 py-2 text-xs transition-colors",
                      active ? "text-primary" : "text-muted-foreground",
                      "hover:text-primary"
                    )}
                  >
                    <span className={cn("inline-flex", active ? "text-primary" : "text-muted-foreground")}>
                      {it.icon}
                    </span>
                    <span className="sr-only sm:not-sr-only">{it.label}</span>
                  </Link>
                </li>
              );
            })}
        </ul>
      </div>
    </nav>
  );
};

export default BottomNav;
