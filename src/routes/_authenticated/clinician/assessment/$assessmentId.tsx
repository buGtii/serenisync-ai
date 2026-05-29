import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import {
  ChevronLeft, Save, Printer, Plus, X, AlertTriangle, ClipboardCheck, Activity,
  Compass, Sparkles, Target,
} from "lucide-react";

export const Route = createFileRoute("/_authenticated/clinician/assessment/$assessmentId")({
  component: AssessmentDetail,
});

type Disorder = {
  id: string; slug: string; name: string;
  symptoms: string[] | null;
  duration_requirement: string | null;
  treatment_overview: string | null;
};
type Criterion = { id: string; code: string; description: string };
type Assessment = {
  id: string;
  client_id: string;
  title: string;
  status: string;
  complaints: string[];
  characteristics: { onset?: string; duration?: string; frequency?: string; severity?: string; triggers?: string; progression?: string };
  impairment: { occupational?: string; social?: string; relationships?: string; academic?: string; daily?: string };
  criteria_marks: Record<string, "yes" | "no" | "unsure">;
  working_disorder_id: string | null;
  severity: string | null;
  specifiers: string[];
  risk_flags: string[];
  notes: string | null;
};

const RISK_OPTIONS = [
  "Suicidal ideation", "Self-harm risk", "Psychosis indicators",
  "Mania indicators", "Severe functional impairment", "Substance risk",
];

function AssessmentDetail() {
  const { assessmentId } = Route.useParams();
  const { user, roles } = useAuth();
  const navigate = useNavigate();
  const isClinician = roles.includes("clinician") || roles.includes("admin");

  const [a, setA] = useState<Assessment | null>(null);
  const [working, setWorking] = useState<Disorder | null>(null);
  const [criteria, setCriteria] = useState<Criterion[]>([]);
  const [disorderQuery, setDisorderQuery] = useState("");
  const [disorderResults, setDisorderResults] = useState<Disorder[]>([]);
  const [saving, setSaving] = useState(false);
  const [newComplaint, setNewComplaint] = useState("");

  useEffect(() => {
    if (!user) return;
    supabase
      .from("clinical_assessments")
      .select("*")
      .eq("id", assessmentId)
      .single()
      .then(({ data, error }) => {
        if (error) { toast.error(error.message); return; }
        setA(data as Assessment);
      });
  }, [assessmentId, user]);

  useEffect(() => {
    if (!a?.working_disorder_id) { setWorking(null); setCriteria([]); return; }
    Promise.all([
      supabase.from("dsm_disorders").select("id,slug,name,symptoms,duration_requirement,treatment_overview").eq("id", a.working_disorder_id).maybeSingle(),
      supabase.from("dsm_criteria").select("id,code,description").eq("disorder_id", a.working_disorder_id).order("ordinal"),
    ]).then(([d, c]) => {
      setWorking((d.data as Disorder) ?? null);
      setCriteria((c.data ?? []) as Criterion[]);
    });
  }, [a?.working_disorder_id]);

  useEffect(() => {
    const t = disorderQuery.trim();
    if (t.length < 2) { setDisorderResults([]); return; }
    const id = setTimeout(async () => {
      const { data } = await supabase
        .from("dsm_disorders")
        .select("id,slug,name,symptoms,duration_requirement,treatment_overview")
        .ilike("name", `%${t}%`).limit(8);
      setDisorderResults((data ?? []) as Disorder[]);
    }, 200);
    return () => clearTimeout(id);
  }, [disorderQuery]);

  const completion = useMemo(() => {
    if (!criteria.length) return 0;
    const yes = Object.values(a?.criteria_marks ?? {}).filter((v) => v === "yes").length;
    return Math.round((yes / criteria.length) * 100);
  }, [a?.criteria_marks, criteria.length]);

  if (!isClinician) {
    return <div className="container max-w-2xl mx-auto p-10 text-center">Clinicians only.</div>;
  }
  if (!a) return <div className="container mx-auto p-10 text-sm text-muted-foreground">Loading…</div>;

  const update = (patch: Partial<Assessment>) => setA({ ...a, ...patch });

  const save = async () => {
    setSaving(true);
    const { error } = await supabase
      .from("clinical_assessments")
      .update({
        title: a.title, status: a.status,
        complaints: a.complaints, characteristics: a.characteristics,
        impairment: a.impairment, criteria_marks: a.criteria_marks,
        working_disorder_id: a.working_disorder_id, severity: a.severity,
        specifiers: a.specifiers, risk_flags: a.risk_flags, notes: a.notes,
      })
      .eq("id", a.id);
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success("Saved");
  };

  return (
    <div className="container max-w-4xl mx-auto px-5 sm:px-6 py-8 pb-28 md:pb-14 print:p-0">
      <div className="flex items-center justify-between gap-3 print:hidden">
        <Link to="/clinician/assessment" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ChevronLeft className="h-4 w-4" /> Back
        </Link>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => window.print()}><Printer className="h-4 w-4 mr-1.5" /> Print</Button>
          <Button size="sm" onClick={save} disabled={saving}><Save className="h-4 w-4 mr-1.5" /> {saving ? "Saving…" : "Save"}</Button>
        </div>
      </div>

      {/* Header */}
      <header className="mt-5 rounded-3xl border bg-gradient-hero p-6 sm:p-8">
        <div className="text-xs uppercase tracking-[0.2em] text-primary/70 flex items-center gap-2">
          <Sparkles className="h-3.5 w-3.5" /> DSM-5-TR · Structured Assessment
        </div>
        <Input
          value={a.title}
          onChange={(e) => update({ title: e.target.value })}
          className="mt-3 bg-transparent border-0 px-0 font-serif text-3xl sm:text-4xl h-auto focus-visible:ring-0 shadow-none"
        />
        <div className="mt-3 flex flex-wrap gap-2 items-center text-xs text-muted-foreground">
          <span className="font-mono">Client {a.client_id}</span>
          <Badge variant="secondary" className="capitalize">{a.status.replace("_", " ")}</Badge>
          {a.severity && <Badge variant="outline" className="capitalize">Severity: {a.severity}</Badge>}
        </div>
      </header>

      {/* Stage 1: complaints */}
      <Stage step={1} title="Presenting complaints" icon={<Activity className="h-4 w-4" />}>
        <div className="flex gap-2">
          <Input
            placeholder="e.g. low mood, intrusive thoughts, panic attacks"
            value={newComplaint}
            onChange={(e) => setNewComplaint(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && newComplaint.trim()) {
                update({ complaints: [...a.complaints, newComplaint.trim()] });
                setNewComplaint("");
              }
            }}
          />
          <Button
            type="button" variant="outline"
            onClick={() => {
              if (!newComplaint.trim()) return;
              update({ complaints: [...a.complaints, newComplaint.trim()] });
              setNewComplaint("");
            }}
          ><Plus className="h-4 w-4" /></Button>
        </div>
        <div className="mt-3 flex gap-2 flex-wrap">
          {a.complaints.map((c, i) => (
            <Badge key={i} variant="secondary" className="rounded-full pl-3 pr-1 py-1 gap-1">
              {c}
              <button
                type="button"
                onClick={() => update({ complaints: a.complaints.filter((_, j) => j !== i) })}
                className="rounded-full p-0.5 hover:bg-background/60"
              ><X className="h-3 w-3" /></button>
            </Badge>
          ))}
          {a.complaints.length === 0 && <span className="text-xs text-muted-foreground">No complaints added yet.</span>}
        </div>
      </Stage>

      {/* Stage 2: characteristics */}
      <Stage step={2} title="Symptom characteristics">
        <div className="grid sm:grid-cols-2 gap-3">
          {(["onset", "duration", "frequency", "severity", "triggers", "progression"] as const).map((k) => (
            <div key={k}>
              <Label className="capitalize text-xs text-muted-foreground">{k}</Label>
              <Input
                className="mt-1"
                value={a.characteristics[k] ?? ""}
                onChange={(e) => update({ characteristics: { ...a.characteristics, [k]: e.target.value } })}
              />
            </div>
          ))}
        </div>
      </Stage>

      {/* Stage 3: impairment */}
      <Stage step={3} title="Functional impairment">
        <div className="grid sm:grid-cols-2 gap-3">
          {(["occupational", "social", "relationships", "academic", "daily"] as const).map((k) => (
            <div key={k}>
              <Label className="capitalize text-xs text-muted-foreground">{k === "daily" ? "Daily life" : k}</Label>
              <Textarea
                rows={2} className="mt-1"
                value={a.impairment[k] ?? ""}
                onChange={(e) => update({ impairment: { ...a.impairment, [k]: e.target.value } })}
              />
            </div>
          ))}
        </div>
      </Stage>

      {/* Stage 4: DSM criteria matching */}
      <Stage step={4} title="DSM-5 criteria matching" icon={<ClipboardCheck className="h-4 w-4" />}>
        <Label className="text-xs text-muted-foreground">Working disorder</Label>
        {working ? (
          <div className="mt-1.5 flex flex-wrap items-center gap-2">
            <Badge variant="default" className="rounded-full">{working.name}</Badge>
            <Link to="/dsm/disorder/$disorderSlug" params={{ disorderSlug: working.slug }} className="text-xs underline text-muted-foreground">View full criteria</Link>
            <Button size="sm" variant="ghost" onClick={() => update({ working_disorder_id: null, criteria_marks: {} })}>
              <X className="h-3 w-3 mr-1" /> Change
            </Button>
          </div>
        ) : (
          <>
            <Input
              className="mt-1.5"
              placeholder="Search DSM-5 disorders…"
              value={disorderQuery}
              onChange={(e) => setDisorderQuery(e.target.value)}
            />
            {disorderResults.length > 0 && (
              <div className="mt-2 border rounded-lg divide-y bg-background">
                {disorderResults.map((d) => (
                  <button
                    type="button" key={d.id}
                    className="w-full text-left px-3 py-2.5 text-sm hover:bg-secondary transition"
                    onClick={() => { update({ working_disorder_id: d.id }); setDisorderQuery(""); setDisorderResults([]); }}
                  >{d.name}</button>
                ))}
              </div>
            )}
          </>
        )}

        {working && (
          <div className="mt-5 space-y-2">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Mark each criterion based on the clinical interview</span>
              <span>{completion}% met</span>
            </div>
            {criteria.length === 0 && <p className="text-sm text-muted-foreground">No paraphrased criteria recorded for this disorder yet.</p>}
            <ol className="space-y-2">
              {criteria.map((c) => {
                const v = a.criteria_marks[c.id];
                return (
                  <li key={c.id} className="rounded-xl border p-3 sm:p-4">
                    <div className="flex gap-3">
                      <span className="font-mono text-[11px] mt-0.5 text-primary/80 shrink-0 px-2 py-0.5 rounded-md bg-primary/10">{c.code}</span>
                      <p className="text-sm leading-relaxed">{c.description}</p>
                    </div>
                    <div className="mt-3 flex gap-2 flex-wrap">
                      {(["yes", "no", "unsure"] as const).map((opt) => (
                        <Button
                          key={opt} size="sm"
                          variant={v === opt ? "default" : "outline"}
                          onClick={() => update({ criteria_marks: { ...a.criteria_marks, [c.id]: opt } })}
                          className="capitalize"
                        >{opt}</Button>
                      ))}
                    </div>
                  </li>
                );
              })}
            </ol>

            {working.duration_requirement && (
              <p className="text-xs text-muted-foreground mt-3">
                <span className="font-medium">Duration requirement:</span> {working.duration_requirement}
              </p>
            )}
          </div>
        )}
      </Stage>

      {/* Stage 5: severity + specifiers */}
      <Stage step={5} title="Severity & specifiers" icon={<Target className="h-4 w-4" />}>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <Label className="text-xs text-muted-foreground">Severity</Label>
            <Select value={a.severity ?? ""} onValueChange={(v) => update({ severity: v || null })}>
              <SelectTrigger className="mt-1"><SelectValue placeholder="Select severity" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="mild">Mild</SelectItem>
                <SelectItem value="moderate">Moderate</SelectItem>
                <SelectItem value="severe">Severe</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Status</Label>
            <Select value={a.status} onValueChange={(v) => update({ status: v })}>
              <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="in_progress">In progress</SelectItem>
                <SelectItem value="complete">Complete</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </Stage>

      {/* Stage 6: risk flags */}
      <Stage step={6} title="Risk & safety flags" icon={<AlertTriangle className="h-4 w-4" />} tone="warning">
        <div className="grid sm:grid-cols-2 gap-2">
          {RISK_OPTIONS.map((opt) => {
            const checked = a.risk_flags.includes(opt);
            return (
              <label key={opt} className="flex items-center gap-2 rounded-lg border p-3 cursor-pointer hover:bg-secondary/50">
                <Checkbox
                  checked={checked}
                  onCheckedChange={(v) => {
                    update({
                      risk_flags: v
                        ? [...a.risk_flags, opt]
                        : a.risk_flags.filter((r) => r !== opt),
                    });
                  }}
                />
                <span className="text-sm">{opt}</span>
              </label>
            );
          })}
        </div>
      </Stage>

      {/* Stage 7: clinical notes */}
      <Stage step={7} title="Clinical notes & formulation" icon={<Compass className="h-4 w-4" />}>
        <Textarea
          rows={6}
          placeholder="Case formulation, differential considerations, treatment direction…"
          value={a.notes ?? ""}
          onChange={(e) => update({ notes: e.target.value })}
        />
      </Stage>

      <div className="mt-8 flex flex-wrap gap-2 print:hidden">
        <Button onClick={save} disabled={saving}>
          <Save className="h-4 w-4 mr-1.5" /> {saving ? "Saving…" : "Save assessment"}
        </Button>
        <Button variant="outline" onClick={() => navigate({ to: "/dsm/compare" })}>
          Open differential comparison
        </Button>
      </div>

      <Card className="mt-8 p-4 text-xs text-muted-foreground leading-relaxed bg-muted/40">
        PsyDx supports DSM-5-TR–guided structured assessment. It does not autonomously diagnose;
        the working disorder, criteria interpretation, and final diagnosis remain the clinician's responsibility.
      </Card>
    </div>
  );
}

function Stage({
  step, title, children, icon, tone,
}: { step: number; title: string; children: React.ReactNode; icon?: React.ReactNode; tone?: "warning" }) {
  const toneClass = tone === "warning" ? "bg-destructive/5 border-destructive/20" : "bg-card";
  return (
    <section className={`mt-5 rounded-2xl border p-5 sm:p-6 ${toneClass}`}>
      <div className="flex items-center gap-3">
        <span className="h-8 w-8 rounded-xl bg-secondary text-secondary-foreground grid place-items-center text-sm font-medium">{step}</span>
        <h2 className="font-serif text-xl flex items-center gap-2">{icon}{title}</h2>
      </div>
      <div className="mt-4">{children}</div>
    </section>
  );
}
