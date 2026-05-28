import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { Card } from "@/components/ui/card";
import { ChevronLeft, Flame, TrendingUp, Calendar as CalIcon } from "lucide-react";
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, Legend,
} from "recharts";

export const Route = createFileRoute("/_authenticated/wellness/insights")({ component: Insights });

type Log = { id: string; created_at: string; mood: number; energy: number | null; anxiety: number | null };

function Insights() {
  const { user } = useAuth();
  const [logs, setLogs] = useState<Log[]>([]);

  useEffect(() => {
    if (!user) return;
    const since = new Date(); since.setDate(since.getDate() - 30);
    supabase.from("mood_logs").select("id,created_at,mood,energy,anxiety")
      .gte("created_at", since.toISOString()).order("created_at")
      .then(({ data }) => setLogs((data ?? []) as Log[]));
  }, [user]);

  const data = useMemo(() => {
    const byDay = new Map<string, { mood: number[]; energy: number[]; anxiety: number[] }>();
    logs.forEach((l) => {
      const d = new Date(l.created_at).toISOString().slice(0, 10);
      if (!byDay.has(d)) byDay.set(d, { mood: [], energy: [], anxiety: [] });
      const e = byDay.get(d)!;
      e.mood.push(l.mood);
      if (l.energy != null) e.energy.push(l.energy);
      if (l.anxiety != null) e.anxiety.push(l.anxiety);
    });
    return Array.from(byDay.entries()).map(([day, v]) => ({
      day: day.slice(5),
      Mood: avg(v.mood),
      Energy: avg(v.energy),
      Anxiety: avg(v.anxiety),
    }));
  }, [logs]);

  const stats = useMemo(() => {
    if (logs.length === 0) return null;
    const avgMood = avg(logs.map((l) => l.mood));
    const avgAnxiety = avg(logs.map((l) => l.anxiety ?? 0));
    const dayKeys = new Set(logs.map((l) => new Date(l.created_at).toISOString().slice(0, 10)));
    // streak: consecutive days ending today
    let streak = 0;
    const today = new Date();
    for (let i = 0; i < 60; i++) {
      const d = new Date(today); d.setDate(today.getDate() - i);
      const k = d.toISOString().slice(0, 10);
      if (dayKeys.has(k)) streak++;
      else { if (i === 0) continue; break; }
    }
    return { avgMood, avgAnxiety, streak, count: logs.length };
  }, [logs]);

  return (
    <div className="container max-w-4xl mx-auto px-6 py-12">
      <Link to="/wellness" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ChevronLeft className="h-4 w-4" /> Wellness
      </Link>
      <h1 className="font-serif text-4xl mt-4">Insights</h1>
      <p className="mt-2 text-muted-foreground">Patterns from your last 30 days of check-ins.</p>

      <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Stat icon={<Flame className="h-4 w-4" />} label="Streak" value={stats ? `${stats.streak} day${stats.streak === 1 ? "" : "s"}` : "—"} />
        <Stat icon={<CalIcon className="h-4 w-4" />} label="Check-ins" value={stats ? String(stats.count) : "—"} />
        <Stat icon={<TrendingUp className="h-4 w-4" />} label="Avg mood" value={stats ? stats.avgMood.toFixed(1) + "/10" : "—"} />
        <Stat icon={<TrendingUp className="h-4 w-4" />} label="Avg anxiety" value={stats ? stats.avgAnxiety.toFixed(1) + "/10" : "—"} />
      </div>

      <Card className="mt-6 p-6">
        <h2 className="font-serif text-xl">Daily trends</h2>
        <p className="text-sm text-muted-foreground mt-1">Higher mood and energy, lower anxiety = better days.</p>
        <div className="mt-5 h-72">
          {data.length === 0 ? (
            <div className="h-full flex items-center justify-center text-sm text-muted-foreground">No data yet — log your first check-in on the Wellness page.</div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data}>
                <CartesianGrid strokeOpacity={0.15} />
                <XAxis dataKey="day" tick={{ fontSize: 11 }} />
                <YAxis domain={[0, 10]} tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ borderRadius: 12, fontSize: 12 }} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Line type="monotone" dataKey="Mood" stroke="hsl(var(--primary))" strokeWidth={2.5} dot={false} />
                <Line type="monotone" dataKey="Energy" stroke="oklch(0.7 0.12 145)" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="Anxiety" stroke="oklch(0.65 0.18 25)" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </Card>

      <Card className="mt-6 p-6 bg-gradient-hero">
        <h2 className="font-serif text-xl">Reflection</h2>
        <p className="mt-2 text-sm leading-relaxed">{reflection(stats)}</p>
      </Card>
    </div>
  );
}

function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <Card className="p-4">
      <div className="flex items-center gap-2 text-[11px] uppercase tracking-wider text-muted-foreground">
        <span className="text-primary/70">{icon}</span> {label}
      </div>
      <div className="mt-1 font-serif text-2xl">{value}</div>
    </Card>
  );
}

function avg(xs: number[]): number { return xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : 0; }

function reflection(s: { avgMood: number; avgAnxiety: number; streak: number; count: number } | null) {
  if (!s) return "Log a check-in today to start seeing your patterns.";
  const lines: string[] = [];
  if (s.streak >= 7) lines.push(`Nice — a ${s.streak}-day streak. Consistency is a quiet superpower.`);
  else if (s.streak >= 3) lines.push(`You're on a ${s.streak}-day streak. Keep the rhythm going.`);
  else lines.push("Even a short note today helps the patterns become clear.");
  if (s.avgMood >= 7) lines.push("Your mood has been steady and high. Notice what's working.");
  else if (s.avgMood <= 4) lines.push("Mood has been on the lower side. Be gentle, and reach out if it lingers.");
  if (s.avgAnxiety >= 7) lines.push("Anxiety has been running high — a brief grounding practice can help.");
  return lines.join(" ");
}
