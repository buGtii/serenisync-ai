import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";
import { useTheme } from "@/lib/theme";
import {
  User, Bell, Shield, Settings as SettingsIcon, LogOut, Moon, Sun, Monitor,
  ChevronRight, ShieldAlert, UserCog, Sparkles,
} from "lucide-react";

export const Route = createFileRoute("/_authenticated/profile")({ component: Profile });

function Profile() {
  const { user, roles, signOut } = useAuth();
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();
  const isClinician = roles.includes("clinician") || roles.includes("admin");
  const primaryRole = isClinician ? "Clinician" : roles[0] ?? "Member";

  return (
    <div className="container max-w-2xl mx-auto px-5 py-8 pb-24">
      <header className="flex items-center gap-4">
        <span className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-hero text-primary">
          <User className="h-6 w-6" />
        </span>
        <div className="min-w-0">
          <div className="text-xs uppercase tracking-widest text-muted-foreground">{primaryRole}</div>
          <div className="font-serif text-xl truncate">{user?.email}</div>
        </div>
      </header>

      <Card className="mt-6 p-4 border-border/60 bg-card/70">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="h-4 w-4 text-primary" />
          <h2 className="text-sm font-semibold">Appearance</h2>
        </div>
        <div className="grid grid-cols-3 gap-2">
          <ThemeChoice active={theme === "light"} onClick={() => setTheme("light")} icon={<Sun className="h-4 w-4" />} label="Light" />
          <ThemeChoice active={theme === "dark"} onClick={() => setTheme("dark")} icon={<Moon className="h-4 w-4" />} label="Dark" />
          <ThemeChoice active={theme === "system"} onClick={() => setTheme("system")} icon={<Monitor className="h-4 w-4" />} label="Auto" />
        </div>
      </Card>

      <div className="mt-6 rounded-2xl border border-border/60 bg-card/70 backdrop-blur overflow-hidden">
        <Row to="/notifications" icon={Bell} label="Notifications" />
        <Row to="/settings" icon={SettingsIcon} label="Settings & preferences" />
        <Row to="/onboarding" icon={UserCog} label="Update your profile" />
        <Row to="/crisis" icon={ShieldAlert} label="Crisis resources" />
        <Row to="/settings" icon={Shield} label="Privacy" last />
      </div>

      <Button
        variant="outline"
        className="mt-6 w-full h-12 rounded-2xl"
        onClick={() => signOut().then(() => navigate({ to: "/" }))}
      >
        <LogOut className="h-4 w-4 mr-2" /> Sign out
      </Button>

      <p className="mt-6 text-center text-[11px] text-muted-foreground">
        PsyDx · For education and support only. Not a substitute for diagnosis or treatment.
      </p>
    </div>
  );
}

function Row({ to, icon: Icon, label, last }: { to: string; icon: typeof User; label: string; last?: boolean }) {
  return (
    <Link
      to={to}
      className={`flex items-center gap-3 px-4 py-4 transition active:bg-secondary/50 ${last ? "" : "border-b border-border/60"}`}
    >
      <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-secondary text-secondary-foreground">
        <Icon className="h-4 w-4" />
      </span>
      <span className="flex-1 text-sm">{label}</span>
      <ChevronRight className="h-4 w-4 text-muted-foreground" />
    </Link>
  );
}

function ThemeChoice({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string }) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center justify-center gap-1 rounded-xl border px-2 py-3 text-xs transition active:scale-95 ${
        active ? "border-primary bg-primary/10 text-primary" : "border-border bg-background text-muted-foreground"
      }`}
    >
      {icon}
      {label}
    </button>
  );
}
