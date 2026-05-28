import { createFileRoute, Link } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft } from "lucide-react";

const disorderQO = (slug: string) => queryOptions({
  queryKey: ["dsm_disorder", slug],
  queryFn: async () => {
    const { data: d, error } = await supabase.from("dsm_disorders").select("*").eq("slug", slug).single();
    if (error) throw error;
    const [{ data: criteria }, { data: tools }] = await Promise.all([
      supabase.from("dsm_criteria").select("*").eq("disorder_id", d.id).order("ordinal"),
      supabase.from("dsm_assessment_tools").select("*").eq("disorder_id", d.id),
    ]);
    return { disorder: d, criteria: criteria ?? [], tools: tools ?? [] };
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
    <div className="container max-w-3xl mx-auto px-6 py-12">
      <Link to="/dsm" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"><ChevronLeft className="h-4 w-4" /> Library</Link>
      <h1 className="font-serif text-4xl mt-4">{d.name}</h1>
      <div className="mt-2 flex gap-2 flex-wrap">
        {d.icd10 && <Badge variant="secondary">ICD-10: {d.icd10}</Badge>}
        {d.icd11 && <Badge variant="secondary">ICD-11: {d.icd11}</Badge>}
      </div>
      <p className="mt-5 text-muted-foreground">{d.overview}</p>

      {data.criteria.length > 0 && (
        <Section title="Diagnostic criteria (paraphrased)">
          <ol className="space-y-2">
            {data.criteria.map((c) => (
              <li key={c.id} className="flex gap-3">
                <span className="text-xs font-mono text-muted-foreground mt-1 w-8">{c.code}</span>
                <span className="text-sm">{c.description}</span>
              </li>
            ))}
          </ol>
        </Section>
      )}

      {d.duration_requirement && <Section title="Duration">{d.duration_requirement}</Section>}
      {d.functional_impairment && <Section title="Functional impairment">{d.functional_impairment}</Section>}
      {(d.differential_diagnoses?.length ?? 0) > 0 && <Section title="Differential diagnoses"><Pills items={d.differential_diagnoses ?? []} /></Section>}
      {(d.comorbidities?.length ?? 0) > 0 && <Section title="Common comorbidities"><Pills items={d.comorbidities ?? []} /></Section>}
      {(d.risk_factors?.length ?? 0) > 0 && <Section title="Risk factors"><Pills items={d.risk_factors ?? []} /></Section>}
      {d.developmental_considerations && <Section title="Developmental considerations">{d.developmental_considerations}</Section>}
      {d.cultural_considerations && <Section title="Cultural considerations">{d.cultural_considerations}</Section>}
      {data.tools.length > 0 && (
        <Section title="Assessment tools">
          <ul className="space-y-2">
            {data.tools.map((t) => (
              <li key={t.id} className="text-sm"><span className="font-medium">{t.acronym ? `${t.acronym} — ` : ""}{t.name}.</span> <span className="text-muted-foreground">{t.description}</span></li>
            ))}
          </ul>
        </Section>
      )}

      <Card className="mt-10 p-5 bg-muted/40 text-xs text-muted-foreground">
        Educational framework inspired by DSM-5-TR (APA, 2022). Not for diagnostic use. Always consult a licensed mental health professional.
      </Card>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mt-8">
      <h2 className="font-serif text-xl">{title}</h2>
      <div className="mt-3 text-sm">{typeof children === "string" ? <p className="text-muted-foreground">{children}</p> : children}</div>
    </div>
  );
}

function Pills({ items }: { items: string[] }) {
  return <div className="flex gap-2 flex-wrap">{items.map((i) => <Badge key={i} variant="outline">{i}</Badge>)}</div>;
}
