"use client";

import { createContext, useContext, useEffect, useState } from "react";

type Theme = "light" | "dark";

const Ctx = createContext<{ theme: Theme; toggleTheme: () => void } | null>(null);

function applyDomTheme(theme: Theme) {
  document.documentElement.classList.toggle("dark", theme === "dark");
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>("light");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("cnlab-theme") as Theme | null;
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const initial: Theme = stored === "dark" || stored === "light" ? stored : prefersDark ? "dark" : "light";
    setTheme(initial);
    applyDomTheme(initial);
    setReady(true);
  }, []);

  const toggleTheme = () => {
    setTheme((t) => {
      const next: Theme = t === "light" ? "dark" : "light";
      localStorage.setItem("cnlab-theme", next);
      applyDomTheme(next);
      return next;
    });
  };

  return (
    <Ctx.Provider value={{ theme: ready ? theme : "light", toggleTheme }}>{children}</Ctx.Provider>
  );
}

export function useThemeMode() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useThemeMode requires ThemeProvider");
  return v;
}
