import { createFileRoute, Link } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookmarkButton } from "@/components/BookmarkButton";
import {
  ChevronLeft, Sparkles, Activity, Users, Compass, AlertTriangle,
  HeartHandshake, Baby, Globe2, ClipboardList, Pill, TrendingUp, BookOpen,
} from "lucide-react";

const disorderQO = (slug: string) => queryOptions({
  queryKey: ["dsm_disorder", slug],
  queryFn: async () => {
    const { data: d, error } = await supabase.from("dsm_disorders").select("*").eq("slug", slug).single();
    if (error) throw error;
    const [{ data: criteria }, { data: tools }, { data: specifiers }] = await Promise.all([
      supabase.from("dsm_criteria").select("*").eq("disorder_id", d.id).order("ordinal"),
      supabase.from("dsm_assessment_tools").select("*").eq("disorder_id", d.id),
      supabase.from("dsm_specifiers").select("*").eq("disorder_id", d.id),
    ]);
    return { disorder: d, criteria: criteria ?? [], tools: tools ?? [], specifiers: specifiers ?? [] };
  },
});

export const Route = createFileRoute("/_authenticated/dsm/disorder/$disorderSlug")({
  loader: ({ params, context }) => context.queryClient.ensureQueryData(disorderQO(params.disorderSlug)),
  component: Disorder,
});

function Disorder() {
  const { disorderSlug } = Route.useParams();
  const { data } = useSuspenseQuery(disorderQO(disorderSlug));
  const d = data.disorder;

  return (
    <div className="container max-w-3xl mx-auto px-6 py-10 sm:py-14">
      <Link to="/dsm" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition">
        <ChevronLeft className="h-4 w-4" /> Back to library
      </Link>

      {/* Hero */}
      <header className="mt-5 rounded-3xl border bg-gradient-hero p-7 sm:p-9 shadow-soft">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-primary/70">
            <Sparkles className="h-3.5 w-3.5" /> DSM-5-TR · Educational Summary
          </div>
          <BookmarkButton disorderId={d.id} />
        </div>
        <h1 className="font-serif text-4xl sm:text-5xl mt-3 leading-[1.05]">{d.name}</h1>
        <div className="mt-4 flex gap-2 flex-wrap">
          {d.icd10 && <Badge variant="secondary" className="rounded-full">ICD-10 · {d.icd10}</Badge>}
          {d.icd11 && <Badge variant="secondary" className="rounded-full">ICD-11 · {d.icd11}</Badge>}
        </div>
        <p className="mt-5 text-[15px] sm:text-base text-foreground/80 leading-relaxed max-w-2xl">{d.overview}</p>
      </header>

      {/* Quick facts */}
      {(d.prevalence || d.course || d.duration_requirement) && (
        <div className="mt-6 grid sm:grid-cols-3 gap-3">
          {d.prevalence && <Fact icon={<Users className="h-4 w-4" />} label="Prevalence" value={d.prevalence} />}
          {d.course && <Fact icon={<TrendingUp className="h-4 w-4" />} label="Course" value={d.course} />}
          {d.duration_requirement && <Fact icon={<Activity className="h-4 w-4" />} label="Duration" value={d.duration_requirement} />}
        </div>
      )}

      {/* Symptoms */}
      {(d.symptoms?.length ?? 0) > 0 && (
        <Section icon={<Activity className="h-5 w-5" />} title="Common symptoms" tone="primary">
          <ul className="grid sm:grid-cols-2 gap-2.5">
            {d.symptoms!.map((s) => (
              <li key={s} className="flex gap-3 items-start text-sm leading-relaxed">
                <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary/60 shrink-0" />
                <span>{s}</span>
              </li>
            ))}
          </ul>
        </Section>
      )}

      {data.criteria.length > 0 && (
        <Section icon={<ClipboardList className="h-5 w-5" />} title="Diagnostic criteria (paraphrased)">
          <ol className="space-y-3">
            {data.criteria.map((c) => (
              <li key={c.id} className="flex gap-4">
                <span className="text-[11px] font-mono font-medium text-primary/80 mt-0.5 px-2 py-0.5 rounded-md bg-primary/8 shrink-0">{c.code}</span>
                <span className="text-sm leading-relaxed">{c.description}</span>
              </li>
            ))}
          </ol>
        </Section>
      )}

      {d.treatment_overview && (
        <Section icon={<Pill className="h-5 w-5" />} title="Treatment overview" tone="accent">
          <p className="text-sm leading-relaxed">{d.treatment_overview}</p>
        </Section>
      )}

      {d.functional_impairment && (
        <Section icon={<AlertTriangle className="h-5 w-5" />} title="Functional impairment">
          <p className="text-sm leading-relaxed text-muted-foreground">{d.functional_impairment}</p>
        </Section>
      )}

      {(d.differential_diagnoses?.length ?? 0) > 0 && (
        <Section icon={<Compass className="h-5 w-5" />} title="Differential diagnoses">
          <Pills items={d.differential_diagnoses!} />
        </Section>
      )}

      {(d.comorbidities?.length ?? 0) > 0 && (
        <Section icon={<HeartHandshake className="h-5 w-5" />} title="Common comorbidities">
          <Pills items={d.comorbidities!} />
        </Section>
      )}

      {(d.risk_factors?.length ?? 0) > 0 && (
        <Section icon={<AlertTriangle className="h-5 w-5" />} title="Risk factors">
          <Pills items={d.risk_factors!} />
        </Section>
      )}

      {d.developmental_considerations && (
        <Section icon={<Baby className="h-5 w-5" />} title="Developmental considerations">
          <p className="text-sm leading-relaxed text-muted-foreground">{d.developmental_considerations}</p>
        </Section>
      )}

      {d.cultural_considerations && (
        <Section icon={<Globe2 className="h-5 w-5" />} title="Cultural considerations">
          <p className="text-sm leading-relaxed text-muted-foreground">{d.cultural_considerations}</p>
        </Section>
      )}

      {data.specifiers.length > 0 && (
        <Section icon={<Sparkles className="h-5 w-5" />} title="Specifiers">
          <ul className="space-y-2">
            {data.specifiers.map((s) => (
              <li key={s.id} className="text-sm leading-relaxed">
                <span className="font-medium">{s.label}.</span>
                {s.description && <span className="text-muted-foreground"> {s.description}</span>}
              </li>
            ))}
          </ul>
        </Section>
      )}

      {data.tools.length > 0 && (
        <Section icon={<BookOpen className="h-5 w-5" />} title="Assessment tools">
          <ul className="space-y-3">
            {data.tools.map((t) => (
              <li key={t.id} className="text-sm leading-relaxed">
                <span className="font-medium">{t.acronym ? `${t.acronym} — ` : ""}{t.name}.</span>{" "}
                <span className="text-muted-foreground">{t.description}</span>
              </li>
            ))}
          </ul>
        </Section>
      )}

      <Card className="mt-10 p-5 bg-muted/40 text-xs text-muted-foreground leading-relaxed">
        Educational framework inspired by DSM-5-TR (APA, 2022). Paraphrased for learning — not for diagnostic use.
        Always consult a licensed mental health professional.
      </Card>
    </div>
  );
}

function Fact({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <Card className="p-4">
      <div className="flex items-center gap-2 text-[11px] uppercase tracking-wider text-muted-foreground">
        <span className="text-primary/70">{icon}</span> {label}
      </div>
      <p className="mt-1.5 text-sm leading-snug">{value}</p>
    </Card>
  );
}

function Section({
  icon, title, children, tone,
}: { icon: React.ReactNode; title: string; children: React.ReactNode; tone?: "primary" | "accent" }) {
  const toneClass =
    tone === "primary" ? "bg-secondary/40 border-secondary"
    : tone === "accent" ? "bg-accent/30 border-accent"
    : "bg-card";
  return (
    <section className={`mt-6 rounded-2xl border p-5 sm:p-6 ${toneClass}`}>
      <div className="flex items-center gap-2.5">
        <span className="h-8 w-8 rounded-xl bg-background/70 border flex items-center justify-center text-primary">
          {icon}
        </span>
        <h2 className="font-serif text-xl sm:text-2xl">{title}</h2>
      </div>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function Pills({ items }: { items: string[] }) {
  return (
    <div className="flex gap-2 flex-wrap">
      {items.map((i) => (
        <Badge key={i} variant="outline" className="rounded-full bg-background/60 font-normal">{i}</Badge>
      ))}
    </div>
  );
}
