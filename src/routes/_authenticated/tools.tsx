import { createFileRoute, Link } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/lib/auth";
import {
  HeartPulse, ClipboardCheck, MessageCircle, ShieldAlert, Compass,
  ClipboardList, Users, Calendar, BarChart3, Heart, UserCog,
} from "lucide-react";

export const Route = createFileRoute("/_authenticated/tools")({ component: Tools });

type Tool = { to: string; icon: typeof HeartPulse; title: string; body: string };

function Tools() {
  const { roles } = useAuth();
  const isClinician = roles.includes("clinician") || roles.includes("admin");

  const wellness: Tool[] = [
    { to: "/wellness", icon: HeartPulse, title: "Mood & journal", body: "Track mood, energy, anxiety. Private entries." },
    { to: "/wellness/insights", icon: BarChart3, title: "Insights", body: "See trends from your tracked entries." },
    { to: "/assessments", icon: ClipboardCheck, title: "Self-assessments", body: "PHQ-9, GAD-7, PCL-5 screeners." },
  ];

  const support: Tool[] = [
    { to: "/therapists", icon: Users, title: "Find a therapist", body: "Browse clinicians taking new clients." },
    { to: "/bookings", icon: Calendar, title: "Bookings", body: "Requests, confirmations, messaging." },
    { to: "/crisis", icon: ShieldAlert, title: "Crisis resources", body: "One-tap international hotlines." },
  ];

  const clinical: Tool[] = [
    { to: "/clinician/assessment", icon: ClipboardList, title: "DSM-5 assessment", body: "Structured intake → criteria match." },
    { to: "/dsm/compare", icon: Compass, title: "Differential workbench", body: "Compare disorders side by side." },
    { to: "/clinician", icon: UserCog, title: "Client roster", body: "SOAP notes & treatment plans." },
    { to: "/chat", icon: MessageCircle, title: "Case-reasoning AI", body: "DSM-5-guided clinical helper." },
  ];

  const study: Tool[] = [
    { to: "/dsm/favorites", icon: Heart, title: "Favorites", body: "Your saved disorders." },
    { to: "/dsm/compare", icon: Compass, title: "Compare disorders", body: "Study tool for overlapping signs." },
  ];

  return (
    <div className="container max-w-2xl mx-auto px-5 py-8 pb-24">
      <header>
        <div className="text-xs uppercase tracking-widest text-muted-foreground">Toolkit</div>
        <h1 className="font-serif text-3xl mt-1">Tools</h1>
        <p className="mt-1 text-sm text-muted-foreground">Everything you need, organised by purpose.</p>
      </header>

      <Section title="Wellness" items={wellness} />
      <Section title="Support" items={support} />
      {isClinician ? <Section title="Clinical" items={clinical} /> : <Section title="Study" items={study} />}
    </div>
  );
}

function Section({ title, items }: { title: string; items: Tool[] }) {
  return (
    <section className="mt-8">
      <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">{title}</h2>
      <div className="grid grid-cols-2 gap-3">
        {items.map((t) => (
          <Link key={t.to + t.title} to={t.to}>
            <Card className="p-4 h-full border-border/60 bg-card/70 backdrop-blur transition active:scale-[0.98]">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-primary/15 text-primary">
                <t.icon className="h-5 w-5" />
              </span>
              <div className="mt-3 font-serif text-base leading-tight">{t.title}</div>
              <div className="mt-1 text-xs text-muted-foreground leading-snug">{t.body}</div>
            </Card>
          </Link>
        ))}
      </div>
    </section>
  );
}
