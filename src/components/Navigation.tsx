import { Link, useNavigate } from "react-router-dom";
import { useUser } from "@/context/UserProvider";
import { ThemeToggle } from "./ui/ThemeToggle";

interface NavigationProps {
  role: "admin" | "user" | null;
}
export const Navigation = () => {
  const { user } = useUser();


  const role = user?.role ?? null;

  const linkTo = (() => {
    switch (role) {
      case "ADMIN": return "/manager-dashboard";
      case "USER": return "/manager";
      default: return "/";
    }
  })();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to={linkTo} className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            피방자리
          </Link>
          <ThemeToggle />
        </div>
      </div>
    </nav>
  );
};
