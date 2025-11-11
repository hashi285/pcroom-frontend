// src/components/ThemeToggle.tsx
import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ThemeToggle() {
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    const stored = localStorage.getItem("theme");
    if (stored === "dark") {
      setTheme("dark");
      document.documentElement.classList.add("dark");
    }
  }, []);

  const toggleTheme = () => {
    const next = theme === "light" ? "dark" : "light";
    setTheme(next);
    localStorage.setItem("theme", next);
    document.documentElement.classList.toggle("dark", next === "dark");
  };

  return (
    <Button
      onClick={toggleTheme}
      size="icon"
      className="
        rounded-full
        border border-white/20 dark:border-black/30
        bg-white/20 dark:bg-black/30
        backdrop-blur-sm
        shadow-md
        hover:bg-white/30 dark:hover:bg-black/50
        transition-colors
      "
    >
      {theme === "light" ? (
        <Moon className="w-5 h-5 text-neutral-800 dark:text-white" />
      ) : (
        <Sun className="w-5 h-5 text-yellow-400" />
      )}
    </Button>
  );
}
