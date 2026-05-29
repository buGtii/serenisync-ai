import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronLeft, Compass, X, Search } from "lucide-react";

export const Route = createFileRoute("/_authenticated/dsm/compare")({ component: Compare });

type D = {
  id: string; slug: string; name: string;
  symptoms: string[] | null;
  duration_requirement: string | null;
  differential_diagnoses: string[] | null;
  exclusion_criteria: string | null;
  treatment_overview: string | null;
};

function Compare() {
  const [q, setQ] = useState("");
  const [results, setResults] = useState<D[]>([]);
  const [picks, setPicks] = useState<D[]>([]);

  useEffect(() => {
    const t = q.trim();
    if (t.length < 2) { setResults([]); return; }
    const id = setTimeout(async () => {
      const { data } = await supabase
        .from("dsm_disorders")
        .select("id,slug,name,symptoms,duration_requirement,differential_diagnoses,exclusion_criteria,treatment_overview")
        .ilike("name", `%${t}%`).limit(10);
      setResults((data ?? []) as D[]);
    }, 200);
    return () => clearTimeout(id);
  }, [q]);

  const add = (d: D) => {
    if (picks.find((p) => p.id === d.id)) return;
    if (picks.length >= 3) return;
    setPicks([...picks, d]);
    setQ(""); setResults([]);
  };

  return (
    <div className="container max-w-6xl mx-auto px-5 sm:px-6 py-10 pb-24 md:pb-14">
      <Link to="/dsm" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ChevronLeft className="h-4 w-4" /> Back to library
      </Link>

      <header className="mt-5 rounded-3xl border bg-gradient-hero p-6 sm:p-8">
        <div className="text-xs uppercase tracking-[0.2em] text-primary/70 flex items-center gap-2">
          <Compass className="h-3.5 w-3.5" /> Differential Diagnosis Workbench
        </div>
        <h1 className="font-serif text-3xl sm:text-4xl mt-2">Compare disorders side by side</h1>
        <p className="text-sm text-muted-foreground mt-2 max-w-2xl">
          Add up to three DSM-5 disorders to compare overlapping symptoms, duration requirements,
          exclusion criteria, and treatment direction. Supports structured clinical reasoning — not autonomous diagnosis.
        </p>
      </header>

      <Card className="p-5 mt-6">
        <div className="relative">
          <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={picks.length >= 3 ? "Remove a disorder to add another…" : "Search to add a disorder…"}
            disabled={picks.length >= 3}
            className="pl-9"
          />
        </div>
        {results.length > 0 && (
          <div className="mt-3 border rounded-lg divide-y">
            {results.map((d) => (
              <button
                key={d.id} type="button"
                onClick={() => add(d)}
                className="block w-full text-left px-3 py-2 text-sm hover:bg-secondary"
              >{d.name}</button>
            ))}
          </div>
        )}
      </Card>

      {picks.length === 0 ? (
        <p className="text-sm text-muted-foreground mt-8">Add 2–3 disorders to start comparing.</p>
      ) : (
        <div className="mt-6 grid gap-4 lg:grid-cols-3 md:grid-cols-2">
          {picks.map((d) => (
            <Card key={d.id} className="p-5 relative">
              <Button
                size="icon" variant="ghost"
                className="absolute top-2 right-2 h-7 w-7"
                onClick={() => setPicks(picks.filter((p) => p.id !== d.id))}
              ><X className="h-4 w-4" /></Button>
              <Link to="/dsm/disorder/$disorderSlug" params={{ disorderSlug: d.slug }}>
                <h2 className="font-serif text-lg hover:underline">{d.name}</h2>
              </Link>
              <Block label="Duration">{d.duration_requirement ?? "—"}</Block>
              <Block label="Core symptoms">
                {(d.symptoms ?? []).length === 0 ? "—" : (
                  <ul className="mt-1 space-y-1 text-sm">
                    {d.symptoms!.slice(0, 8).map((s) => (
                      <li key={s} className="flex gap-2"><span className="text-primary/60">•</span>{s}</li>
                    ))}
                  </ul>
                )}
              </Block>
              <Block label="Common differentials">
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {(d.differential_diagnoses ?? []).map((x) => (
                    <Badge key={x} variant="outline" className="rounded-full font-normal text-[11px]">{x}</Badge>
                  ))}
                  {(d.differential_diagnoses ?? []).length === 0 && <span className="text-sm text-muted-foreground">—</span>}
                </div>
              </Block>
              <Block label="Rule-out / exclusion">
                <span className="text-sm">{d.exclusion_criteria ?? "—"}</span>
              </Block>
              <Block label="Treatment direction">
                <span className="text-sm">{d.treatment_overview ?? "—"}</span>
              </Block>
            </Card>
          ))}
        </div>
      )}

      {picks.length >= 2 && (
        <Card className="mt-6 p-5 bg-muted/40">
          <h3 className="font-serif text-lg">Overlap snapshot</h3>
          <p className="text-xs text-muted-foreground mt-1">Symptoms appearing in two or more of the selected disorders.</p>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {overlap(picks).length === 0 && <span className="text-sm text-muted-foreground">No direct symptom overlap detected.</span>}
            {overlap(picks).map((s) => (
              <Badge key={s} variant="secondary" className="rounded-full">{s}</Badge>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}

function Block({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mt-3">
      <div className="text-[11px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="mt-0.5 text-sm">{children}</div>
    </div>
  );
}

function overlap(picks: D[]): string[] {
  const counts = new Map<string, number>();
  picks.forEach((d) => (d.symptoms ?? []).forEach((s) => counts.set(s, (counts.get(s) ?? 0) + 1)));
  return [...counts.entries()].filter(([, n]) => n >= 2).map(([s]) => s);
}
