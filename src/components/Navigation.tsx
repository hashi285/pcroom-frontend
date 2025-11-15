import { Link } from "react-router-dom";
import { ThemeToggle } from "./ui/ThemeToggle";

export const Navigation = () => {
  const linkTo = "/dashboard";

  return (
    <nav className="fixed top-0 left-0 right-0 z-[999] bg-background/80 backdrop-blur-lg border-b border-border">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link
            to={linkTo}
            className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent"
          >
            피방자리
          </Link>

          <ThemeToggle />
        </div>
      </div>
    </nav>
  );
};
