import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Users, Globe2 } from "lucide-react";

export const Route = createFileRoute("/_authenticated/therapists/")({ component: Page });

type T = {
  id: string; user_id: string; display_name: string; headline: string | null;
  specialties: string[]; modalities: string[]; languages: string[];
  country: string | null; hourly_rate_cents: number | null; currency: string;
  years_experience: number | null; accepting_new_clients: boolean;
};

function Page() {
  const [list, setList] = useState<T[]>([]);
  const [q, setQ] = useState("");

  useEffect(() => {
    supabase.from("therapist_profiles").select("*")
      .eq("accepting_new_clients", true).order("created_at", { ascending: false })
      .then(({ data }) => setList((data ?? []) as T[]));
  }, []);

  const filtered = list.filter((t) => {
    if (!q.trim()) return true;
    const hay = [t.display_name, t.headline, ...t.specialties, ...t.modalities, ...t.languages, t.country].join(" ").toLowerCase();
    return hay.includes(q.toLowerCase());
  });

  return (
    <div className="container max-w-5xl mx-auto px-6 py-12">
      <div className="flex items-center gap-3">
        <Users className="h-6 w-6 text-primary" />
        <h1 className="font-serif text-4xl">Find a therapist</h1>
      </div>
      <p className="mt-2 text-muted-foreground">Browse clinicians accepting new clients. Filter by specialty, modality, or language.</p>

      <Input className="mt-6 max-w-md" placeholder="Search e.g. anxiety, CBT, Spanish" value={q} onChange={(e) => setQ(e.target.value)} />

      <div className="mt-8 grid md:grid-cols-2 gap-4">
        {filtered.length === 0 ? (
          <p className="text-sm text-muted-foreground">No therapists found.</p>
        ) : filtered.map((t) => (
          <Link key={t.id} to="/therapists/$therapistId" params={{ therapistId: t.user_id }}>
            <Card className="p-5 hover:shadow-soft transition h-full">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-serif text-xl">{t.display_name}</h3>
                  {t.headline && <p className="text-sm text-muted-foreground mt-1">{t.headline}</p>}
                </div>
                {t.hourly_rate_cents && (
                  <div className="text-right text-sm"><span className="font-mono">${(t.hourly_rate_cents/100).toFixed(0)}</span><div className="text-xs text-muted-foreground">{t.currency}/hr</div></div>
                )}
              </div>
              <div className="flex flex-wrap gap-1.5 mt-4">
                {t.specialties.slice(0, 4).map((s) => <Badge key={s} variant="secondary">{s}</Badge>)}
              </div>
              <div className="flex items-center gap-3 mt-4 text-xs text-muted-foreground">
                {t.country && <span className="inline-flex items-center gap-1"><Globe2 className="h-3 w-3" />{t.country}</span>}
                {t.languages.length > 0 && <span>{t.languages.join(", ")}</span>}
                {t.years_experience != null && <span>{t.years_experience}+ yrs</span>}
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
