import { createFileRoute, Outlet, Link, useNavigate, useLocation } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { CommandPalette } from "@/components/CommandPalette";
import { NotificationBell } from "@/components/NotificationBell";
import { Brain, LayoutDashboard, BookOpen, HeartPulse, MessageCircle, LogOut, Settings, Heart, Users, Calendar, UserCog, BarChart3 } from "lucide-react";

export const Route = createFileRoute("/_authenticated")({ component: Layout });

function Layout() {
  const { user, loading, signOut, roles } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    if (loading) return;
    if (!user) { navigate({ to: "/login", replace: true }); return; }
    if (location.pathname === "/onboarding") { setChecked(true); return; }
    supabase.from("profiles").select("onboarded_at").eq("id", user.id).maybeSingle()
      .then(({ data }) => {
        if (!data?.onboarded_at) navigate({ to: "/onboarding", replace: true });
        else setChecked(true);
      });
  }, [loading, user, location.pathname, navigate]);

  if (loading || !user || !checked) return <div className="min-h-screen flex items-center justify-center text-muted-foreground">Loading…</div>;

  const isClinician = roles.includes("clinician");

  return (
    <div className="min-h-screen flex">
      <aside className="hidden md:flex w-60 flex-col glass border-r border-border p-4 gap-1">
        <Link to="/" className="flex items-center gap-2 font-serif text-xl px-2 py-3">
          <span className="h-9 w-9 rounded-xl bg-gradient-hero flex items-center justify-center"><Brain className="h-5 w-5 text-primary" /></span>
          Mindscape
        </Link>
        <div className="px-1 pb-2"><CommandPalette /></div>
        <NavItem to="/dashboard" icon={LayoutDashboard}>Dashboard</NavItem>
        <NavItem to="/dsm" icon={BookOpen}>DSM Library</NavItem>
        <NavItem to="/dsm/favorites" icon={Heart}>Favorites</NavItem>
        <NavItem to="/wellness" icon={HeartPulse}>Wellness</NavItem>
        <NavItem to="/wellness/insights" icon={BarChart3}>Insights</NavItem>
        <NavItem to="/chat" icon={MessageCircle}>AI Companion</NavItem>
        <NavItem to="/therapists" icon={Users}>Therapists</NavItem>
        <NavItem to="/bookings" icon={Calendar}>Bookings</NavItem>
        {isClinician && <NavItem to="/clinician" icon={UserCog}>Clinician</NavItem>}
        <div className="mt-auto pt-4 px-2">
          <div className="flex items-center gap-2 mb-2">
            <NotificationBell />
            <Link to="/settings" className="inline-flex items-center justify-center h-9 w-9 rounded-lg hover:bg-secondary transition" aria-label="Settings"><Settings className="h-4 w-4" /></Link>
          </div>
          <div className="text-xs text-muted-foreground truncate mb-2">{user.email}</div>
          <Button variant="ghost" size="sm" className="w-full justify-start" onClick={() => signOut().then(() => navigate({ to: "/" }))}>
            <LogOut className="h-4 w-4 mr-2" /> Sign out
          </Button>
        </div>
      </aside>
      <main className="flex-1 min-w-0"><Outlet /></main>
    </div>
  );
}

function NavItem({ to, icon: Icon, children }: { to: string; icon: typeof Brain; children: React.ReactNode }) {
  return (
    <Link to={to} className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:bg-secondary hover:text-foreground transition" activeProps={{ className: "bg-secondary text-foreground font-medium" }}>
      <Icon className="h-4 w-4" /> {children}
    </Link>
  );
}

function NavItem({ to, icon: Icon, children }: { to: string; icon: typeof Brain; children: React.ReactNode }) {
  return (
    <Link to={to} className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:bg-secondary hover:text-foreground transition" activeProps={{ className: "bg-secondary text-foreground font-medium" }}>
      <Icon className="h-4 w-4" /> {children}
    </Link>
  );
}
