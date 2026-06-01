import { Link } from "@tanstack/react-router";
import { Home, BookOpen, LayoutGrid, User } from "lucide-react";

/**
 * Native-style 4-tab bottom navigation. Hidden on md+ where the sidebar
 * takes over. Tabs are intentionally identical for every role so the app
 * feels like a real mobile product.
 */
export function MobileTabBar() {
  const items = [
    { to: "/dashboard", icon: Home, label: "Home" },
    { to: "/dsm", icon: BookOpen, label: "Library" },
    { to: "/tools", icon: LayoutGrid, label: "Tools" },
    { to: "/profile", icon: User, label: "Profile" },
  ];

  return (
    <nav
      aria-label="Primary"
      className="mobile-tabbar md:hidden fixed bottom-0 inset-x-0 z-40 border-t border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <ul className="grid grid-cols-4 px-1">
        {items.map((i) => (
          <li key={i.to}>
            <Link
              to={i.to}
              className="flex min-h-16 flex-col items-center justify-center gap-1 py-2 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground transition active:scale-95"
              activeProps={{ className: "text-primary" }}
              activeOptions={{ exact: i.to === "/dashboard" }}
            >
              <i.icon className="h-5 w-5" />
              <span>{i.label}</span>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
