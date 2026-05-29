import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/lib/auth";
import { useTheme } from "@/lib/theme";
import { Sun, Moon, Monitor, LogOut, User, Shield, Sparkles } from "lucide-react";

export const Route = createFileRoute("/_authenticated/settings")({ component: Settings });

function Settings() {
  const { user, roles, signOut } = useAuth();
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();

  return (
    <div className="container max-w-3xl mx-auto px-6 py-12">
      <header>
        <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Preferences</div>
        <h1 className="font-serif text-4xl mt-2">Settings</h1>
        <p className="mt-2 text-muted-foreground">Personalize how PsyDx looks and works for you.</p>
      </header>

      <Card className="mt-8 p-6">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" />
          <h2 className="font-serif text-xl">Appearance</h2>
        </div>
        <p className="text-sm text-muted-foreground mt-1">Choose a calm light theme, a low-glare dark theme, or follow your device.</p>
        <div className="mt-5 grid grid-cols-3 gap-3">
          <ThemeChoice active={theme === "light"} onClick={() => setTheme("light")} icon={<Sun className="h-4 w-4" />} label="Light" />
          <ThemeChoice active={theme === "dark"} onClick={() => setTheme("dark")} icon={<Moon className="h-4 w-4" />} label="Dark" />
          <ThemeChoice active={theme === "system"} onClick={() => setTheme("system")} icon={<Monitor className="h-4 w-4" />} label="System" />
        </div>
      </Card>

      <Card className="mt-6 p-6">
        <div className="flex items-center gap-2">
          <User className="h-4 w-4 text-primary" />
          <h2 className="font-serif text-xl">Account</h2>
        </div>
        <div className="mt-4 grid sm:grid-cols-2 gap-4">
          <Field label="Email" value={user?.email ?? "—"} />
          <Field label="User ID" value={user?.id?.slice(0, 8) + "…"} mono />
          <Field label="Roles" value={roles.length ? roles.join(", ") : "client"} />
          <Field label="Member since" value={user?.created_at ? new Date(user.created_at).toLocaleDateString() : "—"} />
        </div>
      </Card>

      <Card className="mt-6 p-6">
        <div className="flex items-center gap-2">
          <Shield className="h-4 w-4 text-primary" />
          <h2 className="font-serif text-xl">Privacy & safety</h2>
        </div>
        <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
          Your mood logs, journal entries, and chats are private to your account. Clinician access only applies when you actively share via a booking or care relationship. Crisis prompts are intercepted before reaching the AI.
        </p>
      </Card>

      <Card className="mt-6 p-6 border-destructive/30">
        <h2 className="font-serif text-xl">Sign out</h2>
        <p className="text-sm text-muted-foreground mt-1">End your session on this device.</p>
        <Button variant="outline" className="mt-4" onClick={() => signOut().then(() => navigate({ to: "/" }))}>
          <LogOut className="h-4 w-4 mr-2" /> Sign out
        </Button>
      </Card>
    </div>
  );
}

function ThemeChoice({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string }) {
  return (
    <button
      type="button" onClick={onClick}
      className={`rounded-xl border p-4 flex flex-col items-center gap-2 transition ${active ? "border-primary bg-primary/8 shadow-soft" : "hover:bg-secondary/50"}`}
    >
      <span className="h-9 w-9 rounded-lg bg-background border flex items-center justify-center">{icon}</span>
      <span className="text-sm">{label}</span>
    </button>
  );
}

function Field({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div>
      <Label className="text-xs uppercase tracking-wider text-muted-foreground">{label}</Label>
      <div className={`mt-1 text-sm ${mono ? "font-mono" : ""}`}>{value}</div>
    </div>
  );
}
