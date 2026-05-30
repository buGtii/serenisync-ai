import { Link } from "@tanstack/react-router";
import { LayoutDashboard, BookOpen, ClipboardList, Compass, Settings } from "lucide-react";
import { useAuth } from "@/lib/auth";

/**
 * Bottom tab bar for mobile / native (Android). Hidden on md+ where the
 * sidebar takes over. Items adapt to role.
 */
export function MobileTabBar() {
  const { roles } = useAuth();
  const isClinician = roles.includes("clinician") || roles.includes("admin");

  const items = [
    { to: "/dashboard", icon: LayoutDashboard, label: "Home" },
    { to: "/dsm", icon: BookOpen, label: "DSM" },
    isClinician
      ? { to: "/clinician/assessment", icon: ClipboardList, label: "Assess" }
      : { to: "/wellness", icon: HeartPulse, label: "Wellness" },
    { to: "/dsm/compare", icon: Compass, label: "Compare", hideForClient: true },
    { to: "/settings", icon: Settings, label: "Settings" },
  ].filter((i) => !(i.hideForClient && !isClinician)).slice(0, 5);

  return (
    <nav
      aria-label="Primary"
      className="mobile-tabbar md:hidden fixed bottom-0 inset-x-0 z-40 border-t border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <ul className="grid grid-cols-5 px-1">
        {items.map((i) => (
          <li key={i.to}>
            <Link
              to={i.to}
              className="flex min-h-16 flex-col items-center justify-center gap-1 py-2 text-[10px] font-semibold uppercase text-muted-foreground transition active:scale-95"
              activeProps={{ className: "text-primary" }}
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
