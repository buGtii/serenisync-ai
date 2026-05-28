import { createFileRoute, Link } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  BookOpen, HeartPulse, MessageCircle, ShieldAlert, GraduationCap,
  ClipboardCheck, Briefcase, Users, Calendar, UserCog, FlaskConical, Stethoscope,
} from "lucide-react";

export const Route = createFileRoute("/_authenticated/dashboard")({ component: Dashboard });

type Tile = { to: string; icon: typeof BookOpen; title: string; body: string };

const TILES = {
  client: [
    { to: "/wellness",    icon: HeartPulse,     title: "Wellness toolkit",  body: "Log mood, energy, anxiety. Write a private journal entry." },
    { to: "/chat",        icon: MessageCircle,  title: "AI Companion",      body: "A reflective conversation with safety screening built-in." },
    { to: "/assessments", icon: ClipboardCheck, title: "Self-assessments",  body: "PHQ-9, GAD-7, PCL-5 — validated screeners with severity scoring." },
    { to: "/therapists",  icon: Users,          title: "Find a therapist",  body: "Browse clinicians accepting new clients." },
    { to: "/bookings",    icon: Calendar,       title: "Your bookings",     body: "Requests, confirmations, and secure messaging." },
    { to: "/dsm",         icon: BookOpen,       title: "Learn (DSM library)", body: "Plain-language summaries — for understanding only, not diagnosis." },
  ] as Tile[],
  student: [
    { to: "/dsm",              icon: BookOpen,     title: "DSM-5-TR Library",  body: "All 20 chapters with paraphrased criteria and differentials." },
    { to: "/dsm/attempts",     icon: GraduationCap, title: "Practice quizzes",  body: "Test your knowledge chapter by chapter. Track your scores." },
    { to: "/assessments",      icon: ClipboardCheck, title: "Try a screener",   body: "Hands-on with PHQ-9, GAD-7, PCL-5." },
    { to: "/wellness",         icon: HeartPulse,   title: "Wellness tools",    body: "Personal mood and journal toolkit." },
    { to: "/chat",             icon: MessageCircle, title: "AI study buddy",   body: "Ask questions, draft case notes, reflect." },
  ] as Tile[],
  clinician: [
    { to: "/clinician",         icon: Briefcase,    title: "Clinician toolkit",  body: "Roster, SOAP notes, assessment administration, treatment plans." },
    { to: "/therapist-profile", icon: UserCog,      title: "Therapist profile",  body: "Manage your marketplace profile and weekly availability." },
    { to: "/bookings",          icon: Calendar,     title: "Bookings",           body: "Confirm, decline, or message requesters." },
    { to: "/dsm",               icon: BookOpen,     title: "DSM diagnostics",    body: "Full criteria, differentials, assessment tools." },
    { to: "/assessments",       icon: ClipboardCheck, title: "Assessments",      body: "Administer and review standardized instruments." },
  ] as Tile[],
  researcher: [
    { to: "/dsm",          icon: BookOpen,      title: "DSM reference",     body: "Browse the educational disorder library." },
    { to: "/assessments",  icon: ClipboardCheck, title: "Screener catalog", body: "Reference for validated instruments." },
    { to: "/wellness",     icon: HeartPulse,    title: "Personal tools",    body: "Wellness toolkit for your own use." },
  ] as Tile[],
};

function Dashboard() {
  const { user, roles } = useAuth();
  const primary: keyof typeof TILES =
    roles.includes("clinician")  ? "clinician" :
    roles.includes("researcher") ? "researcher" :
    roles.includes("student")    ? "student" : "client";

  const tiles = TILES[primary];
  const isClinician = roles.includes("clinician") || roles.includes("admin");
  const greeting =
    primary === "clinician"  ? "Welcome back, clinician." :
    primary === "researcher" ? "Welcome back, researcher." :
    primary === "student"    ? "Ready to study?" :
                               "Hello again.";

  const RoleIcon =
    primary === "clinician" ? Stethoscope :
    primary === "researcher" ? FlaskConical :
    primary === "student" ? GraduationCap : HeartPulse;

  return (
    <div className="container max-w-5xl mx-auto px-6 py-12">
      <div className="flex items-center gap-3 text-xs uppercase tracking-widest text-muted-foreground">
        <RoleIcon className="h-4 w-4" /> {primary} dashboard
        {primary === "clinician" && !isClinician && <Badge variant="outline">Pending verification</Badge>}
      </div>
      <h1 className="font-serif text-4xl mt-2">{greeting}</h1>
      <p className="mt-2 text-muted-foreground">Signed in as {user?.email}.</p>

      <div className="mt-10 grid md:grid-cols-2 gap-5">
        {tiles.map((t) => <TileCard key={t.to} {...t} />)}
        <TileCard to="/crisis" icon={ShieldAlert} title="Crisis resources" body="International hotlines — always one tap away." />
      </div>

      {primary !== "clinician" && (
        <Card className="mt-10 p-5 bg-muted/40 text-xs text-muted-foreground">
          Diagnostic tools, treatment plans, and patient management are restricted to verified clinicians.
        </Card>
      )}
    </div>
  );
}

function TileCard({ to, icon: Icon, title, body }: Tile) {
  return (
    <Link to={to}>
      <Card className="p-6 hover:shadow-soft transition h-full">
        <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-secondary text-secondary-foreground">
          <Icon className="h-5 w-5" />
        </span>
        <h3 className="mt-4 font-serif text-xl">{title}</h3>
        <p className="mt-1 text-sm text-muted-foreground">{body}</p>
      </Card>
    </Link>
  );
}
