import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

type Theme = "light" | "dark" | "system";
interface ThemeCtx { theme: Theme; resolved: "light" | "dark"; setTheme: (t: Theme) => void }
const Ctx = createContext<ThemeCtx>({ theme: "system", resolved: "light", setTheme: () => {} });

function resolve(t: Theme): "light" | "dark" {
  if (t !== "system") return t;
  // Default to dark for the calm psychology aesthetic
  return "dark";
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("dark");
  const [resolved, setResolved] = useState<"light" | "dark">("dark");

  useEffect(() => {
    const stored = (typeof window !== "undefined" && localStorage.getItem("theme")) as Theme | null;
    const t = stored ?? "dark";
    setThemeState(t);
    apply(t);
  }, []);

  function apply(t: Theme) {
    const r = resolve(t);
    setResolved(r);
    const root = document.documentElement;
    root.classList.toggle("dark", r === "dark");
  }

  const setTheme = (t: Theme) => {
    localStorage.setItem("theme", t);
    setThemeState(t);
    apply(t);
  };

  return <Ctx.Provider value={{ theme, resolved, setTheme }}>{children}</Ctx.Provider>;
}

export const useTheme = () => useContext(Ctx);
