import { createFileRoute, Link } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth";
import { Card } from "@/components/ui/card";
import { BookOpen, HeartPulse, MessageCircle, ShieldAlert } from "lucide-react";

export const Route = createFileRoute("/_authenticated/dashboard")({ component: Dashboard });

function Dashboard() {
  const { user, roles } = useAuth();
  const primary = roles[0] ?? "client";

  return (
    <div className="container max-w-5xl mx-auto px-6 py-12">
      <div className="text-xs uppercase tracking-widest text-muted-foreground">{primary} dashboard</div>
      <h1 className="font-serif text-4xl mt-2">Hello again.</h1>
      <p className="mt-2 text-muted-foreground">Welcome back, {user?.email}. Here's where you can start.</p>

      <div className="mt-10 grid md:grid-cols-2 gap-5">
        <Tile to="/dsm" icon={BookOpen} title="DSM-5-TR Library" body="Explore all 20 chapters with paraphrased criteria, differentials, and assessment tools." />
        <Tile to="/wellness" icon={HeartPulse} title="Wellness toolkit" body="Log mood, energy, and anxiety. Write a private journal entry." />
        <Tile to="/chat" icon={MessageCircle} title="AI Companion" body="A reflective conversation, with safety screening before every response." />
        <Tile to="/crisis" icon={ShieldAlert} title="Crisis resources" body="International hotlines and immediate support — always one tap away." />
      </div>
    </div>
  );
}

function Tile({ to, icon: Icon, title, body }: { to: string; icon: typeof BookOpen; title: string; body: string }) {
  return (
    <Link to={to}>
      <Card className="p-6 hover:shadow-soft transition h-full">
        <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-secondary text-secondary-foreground"><Icon className="h-5 w-5" /></span>
        <h3 className="mt-4 font-serif text-xl">{title}</h3>
        <p className="mt-1 text-sm text-muted-foreground">{body}</p>
      </Card>
    </Link>
  );
}
