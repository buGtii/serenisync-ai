import { createFileRoute, Link } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  BookOpen, HeartPulse, MessageCircle, ShieldAlert, GraduationCap,
  ClipboardCheck, Briefcase, Users, Calendar, UserCog, FlaskConical, Stethoscope,
  Compass, ClipboardList,
} from "lucide-react";

export const Route = createFileRoute("/_authenticated/dashboard")({ component: Dashboard });

type Tile = { to: string; icon: typeof BookOpen; title: string; body: string };

const TILES = {
  client: [
    { to: "/wellness",    icon: HeartPulse,     title: "Wellness toolkit",  body: "Log mood, energy, anxiety. Write a private journal entry." },
    { to: "/assessments", icon: ClipboardCheck, title: "Self-assessments",  body: "PHQ-9, GAD-7, PCL-5 — validated screeners with severity scoring." },
    { to: "/therapists",  icon: Users,          title: "Find a therapist",  body: "Browse clinicians accepting new clients." },
    { to: "/bookings",    icon: Calendar,       title: "Your bookings",     body: "Requests, confirmations, and secure messaging." },
    { to: "/dsm",         icon: BookOpen,       title: "Learn (DSM library)", body: "Plain-language summaries — for understanding only, not diagnosis." },
  ] as Tile[],
  student: [
    { to: "/dsm",              icon: BookOpen,     title: "DSM-5-TR Library",  body: "Every chapter with paraphrased criteria and differentials." },
    { to: "/dsm/attempts",     icon: GraduationCap, title: "Practice quizzes",  body: "Test your knowledge chapter by chapter." },
    { to: "/dsm/compare",      icon: Compass,      title: "Compare disorders", body: "Side-by-side study tool for overlapping presentations." },
    { to: "/assessments",      icon: ClipboardCheck, title: "Try a screener",   body: "Hands-on with PHQ-9, GAD-7, PCL-5." },
  ] as Tile[],
  clinician: [
    { to: "/clinician/assessment", icon: ClipboardList, title: "DSM-5 Assessment", body: "Structured intake → criteria matching → severity & specifiers." },
    { to: "/dsm/compare",          icon: Compass,       title: "Differential workbench", body: "Compare up to 3 disorders side by side." },
    { to: "/clinician",            icon: Briefcase,     title: "Client roster",     body: "SOAP notes, treatment plans, administered instruments." },
    { to: "/chat",                 icon: MessageCircle, title: "Case-reasoning AI", body: "DSM-5-guided assistant for organizing clinical reasoning." },
    { to: "/therapist-profile",    icon: UserCog,       title: "Therapist profile", body: "Manage your marketplace profile and availability." },
    { to: "/bookings",             icon: Calendar,      title: "Bookings",          body: "Confirm, decline, or message requesters." },
    { to: "/dsm",                  icon: BookOpen,      title: "DSM-5 library",     body: "Full criteria, differentials, specifiers, assessment tools." },
    { to: "/assessments",          icon: ClipboardCheck, title: "Assessments",      body: "Administer and review standardized instruments." },
  ] as Tile[],
  researcher: [
    { to: "/dsm",          icon: BookOpen,      title: "DSM reference",     body: "Browse the educational disorder library." },
    { to: "/dsm/compare",  icon: Compass,       title: "Compare disorders", body: "Side-by-side overlap analysis." },
    { to: "/assessments",  icon: ClipboardCheck, title: "Screener catalog", body: "Reference for validated instruments." },
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
    <div className="container max-w-5xl mx-auto px-5 sm:px-6 py-10 sm:py-14 pb-24 md:pb-14">
      <div className="flex items-center gap-3 text-xs uppercase tracking-widest text-muted-foreground">
        <RoleIcon className="h-4 w-4" /> {primary} dashboard
        {primary === "clinician" && !isClinician && <Badge variant="outline">Pending verification</Badge>}
      </div>
      <h1 className="font-serif text-3xl sm:text-4xl mt-2">{greeting}</h1>
      <p className="mt-2 text-sm text-muted-foreground">Signed in as {user?.email}.</p>

      <div className="mt-8 grid sm:grid-cols-2 gap-4">
        {tiles.map((t) => <TileCard key={t.to} {...t} />)}
        <TileCard to="/crisis" icon={ShieldAlert} title="Crisis resources" body="International hotlines — always one tap away." />
      </div>

      {primary !== "clinician" && (
        <Card className="mt-8 p-5 bg-muted/40 text-xs text-muted-foreground">
          DSM-5 assessment workflow, differential workbench, and case-reasoning AI are restricted to verified clinicians.
        </Card>
      )}
    </div>
  );
}

function TileCard({ to, icon: Icon, title, body }: Tile) {
  return (
    <Link to={to}>
      <Card className="p-5 sm:p-6 hover:shadow-soft hover:-translate-y-0.5 transition h-full border-border/60">
        <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-secondary text-secondary-foreground">
          <Icon className="h-5 w-5" />
        </span>
        <h3 className="mt-4 font-serif text-lg sm:text-xl">{title}</h3>
        <p className="mt-1 text-sm text-muted-foreground leading-relaxed">{body}</p>
      </Card>
    </Link>
  );
}
