import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { INSTRUMENTS, scoreInstrument, type Instrument } from "@/lib/assessments";
import { toast } from "sonner";
import { ArrowLeft, FileText, ClipboardCheck, Target } from "lucide-react";

export const Route = createFileRoute("/_authenticated/clinician/clients/$clientId")({ component: Page });

type Note = { id: string; session_date: string; subjective: string | null; objective: string | null; assessment: string | null; plan: string | null; created_at: string };
type Assess = { id: string; instrument: string; total_score: number; severity: string | null; created_at: string };
type Plan = { id: string; title: string; diagnosis: string | null; goals: any; interventions: any; target_date: string | null; status: string };

function Page() {
  const { user } = useAuth();
  const { clientId } = Route.useParams();
  const [notes, setNotes] = useState<Note[]>([]);
  const [assess, setAssess] = useState<Assess[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);

  const reload = async () => {
    const [n, a, p] = await Promise.all([
      supabase.from("session_notes").select("*").eq("client_id", clientId).order("session_date", { ascending: false }),
      supabase.from("assessment_administrations").select("id,instrument,total_score,severity,created_at").eq("client_id", clientId).order("created_at", { ascending: false }),
      supabase.from("treatment_plans").select("*").eq("client_id", clientId).order("created_at", { ascending: false }),
    ]);
    setNotes((n.data ?? []) as Note[]);
    setAssess((a.data ?? []) as Assess[]);
    setPlans((p.data ?? []) as Plan[]);
  };
  useEffect(() => { if (user) reload(); /* eslint-disable-next-line */ }, [user, clientId]);

  return (
    <div className="container max-w-5xl mx-auto px-6 py-10">
      <Link to="/clinician" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4 mr-1" /> Back to roster
      </Link>
      <h1 className="font-serif text-3xl mt-3">Client</h1>
      <div className="font-mono text-xs text-muted-foreground mt-1">{clientId}</div>

      <Tabs defaultValue="notes" className="mt-8">
        <TabsList>
          <TabsTrigger value="notes"><FileText className="h-4 w-4 mr-2" />SOAP notes</TabsTrigger>
          <TabsTrigger value="assess"><ClipboardCheck className="h-4 w-4 mr-2" />Assessments</TabsTrigger>
          <TabsTrigger value="plans"><Target className="h-4 w-4 mr-2" />Treatment plans</TabsTrigger>
        </TabsList>

        <TabsContent value="notes" className="mt-6">
          <NotesTab clientId={clientId} clinicianId={user?.id ?? ""} notes={notes} onChange={reload} />
        </TabsContent>
        <TabsContent value="assess" className="mt-6">
          <AssessTab clientId={clientId} clinicianId={user?.id ?? ""} list={assess} onChange={reload} />
        </TabsContent>
        <TabsContent value="plans" className="mt-6">
          <PlansTab clientId={clientId} clinicianId={user?.id ?? ""} plans={plans} onChange={reload} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function NotesTab({ clientId, clinicianId, notes, onChange }: { clientId: string; clinicianId: string; notes: Note[]; onChange: () => void }) {
  const [s, setS] = useState(""); const [o, setO] = useState(""); const [a, setA] = useState(""); const [p, setP] = useState("");
  const save = async () => {
    const { error } = await supabase.from("session_notes").insert({
      clinician_id: clinicianId, client_id: clientId,
      subjective: s, objective: o, assessment: a, plan: p,
    });
    if (error) return toast.error(error.message);
    setS(""); setO(""); setA(""); setP(""); toast.success("Note saved"); onChange();
  };
  return (
    <div className="grid gap-6">
      <Card className="p-6">
        <h3 className="font-serif text-lg">New SOAP note</h3>
        <div className="mt-4 grid gap-3">
          <div><Label>Subjective</Label><Textarea rows={3} value={s} onChange={(e) => setS(e.target.value)} placeholder="Client report, presenting concerns…" /></div>
          <div><Label>Objective</Label><Textarea rows={3} value={o} onChange={(e) => setO(e.target.value)} placeholder="Observations, MSE, scores…" /></div>
          <div><Label>Assessment</Label><Textarea rows={3} value={a} onChange={(e) => setA(e.target.value)} placeholder="Clinical formulation, dx impressions…" /></div>
          <div><Label>Plan</Label><Textarea rows={3} value={p} onChange={(e) => setP(e.target.value)} placeholder="Interventions, homework, next session…" /></div>
          <Button onClick={save} className="w-fit">Save note</Button>
        </div>
      </Card>

      <div className="grid gap-3">
        {notes.map((n) => (
          <Card key={n.id} className="p-5">
            <div className="text-xs text-muted-foreground">{new Date(n.session_date).toLocaleDateString()}</div>
            {n.subjective && <Section title="S" text={n.subjective} />}
            {n.objective && <Section title="O" text={n.objective} />}
            {n.assessment && <Section title="A" text={n.assessment} />}
            {n.plan && <Section title="P" text={n.plan} />}
          </Card>
        ))}
      </div>
    </div>
  );
}

function Section({ title, text }: { title: string; text: string }) {
  return (
    <div className="mt-3"><div className="text-xs font-mono text-primary">{title}</div><div className="text-sm whitespace-pre-wrap mt-1">{text}</div></div>
  );
}

function AssessTab({ clientId, clinicianId, list, onChange }: { clientId: string; clinicianId: string; list: Assess[]; onChange: () => void }) {
  const [key, setKey] = useState<Instrument["key"]>("PHQ-9");
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const inst = INSTRUMENTS[key];
  const allAnswered = inst.items.every((i) => answers[i.id] !== undefined);

  const save = async () => {
    const { total, severity } = scoreInstrument(key, answers);
    const { error } = await supabase.from("assessment_administrations").insert({
      clinician_id: clinicianId, client_id: clientId,
      instrument: key, answers, total_score: total, severity,
    });
    if (error) return toast.error(error.message);
    toast.success(`${key}: ${total} (${severity})`);
    setAnswers({}); onChange();
  };

  return (
    <div className="grid gap-6">
      <Card className="p-6">
        <div className="flex items-center gap-3">
          <h3 className="font-serif text-lg">Administer</h3>
          <Select value={key} onValueChange={(v) => { setKey(v as Instrument["key"]); setAnswers({}); }}>
            <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
            <SelectContent>
              {Object.keys(INSTRUMENTS).map((k) => <SelectItem key={k} value={k}>{k}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <p className="mt-2 text-sm text-muted-foreground">{inst.description}</p>
        <div className="mt-5 grid gap-4">
          {inst.items.map((it, idx) => (
            <div key={it.id} className="border-t pt-4">
              <Label className="text-sm">{idx + 1}. {it.prompt}</Label>
              <div className="mt-2 flex flex-wrap gap-2">
                {it.choices.map((c) => (
                  <button
                    key={c.value}
                    type="button"
                    onClick={() => setAnswers({ ...answers, [it.id]: c.value })}
                    className={`text-xs px-3 py-1.5 rounded-full border transition ${answers[it.id] === c.value ? "bg-primary text-primary-foreground border-primary" : "bg-background hover:bg-secondary"}`}
                  >
                    {c.label} ({c.value})
                  </button>
                ))}
              </div>
            </div>
          ))}
          <Button onClick={save} disabled={!allAnswered} className="w-fit mt-2">Score &amp; save</Button>
        </div>
      </Card>

      <div className="grid gap-3">
        <h3 className="font-serif text-lg">History</h3>
        {list.length === 0 ? <p className="text-sm text-muted-foreground">No administrations yet.</p> : list.map((r) => (
          <Card key={r.id} className="p-4 flex justify-between items-center">
            <div>
              <div className="font-medium">{r.instrument}</div>
              <div className="text-xs text-muted-foreground">{new Date(r.created_at).toLocaleString()}</div>
            </div>
            <div className="text-right">
              <div className="font-serif text-2xl">{r.total_score}</div>
              {r.severity && <Badge variant="secondary" className="mt-1">{r.severity}</Badge>}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

function PlansTab({ clientId, clinicianId, plans, onChange }: { clientId: string; clinicianId: string; plans: Plan[]; onChange: () => void }) {
  const [title, setTitle] = useState(""); const [dx, setDx] = useState("");
  const [goals, setGoals] = useState(""); const [interv, setInterv] = useState("");
  const [target, setTarget] = useState("");

  const save = async () => {
    if (!title.trim()) return;
    const { error } = await supabase.from("treatment_plans").insert({
      clinician_id: clinicianId, client_id: clientId,
      title, diagnosis: dx || null,
      goals: goals.split("\n").filter(Boolean).map((g) => ({ goal: g })),
      interventions: interv.split("\n").filter(Boolean).map((i) => ({ intervention: i })),
      target_date: target || null,
    });
    if (error) return toast.error(error.message);
    setTitle(""); setDx(""); setGoals(""); setInterv(""); setTarget("");
    toast.success("Plan created"); onChange();
  };

  return (
    <div className="grid gap-6">
      <Card className="p-6">
        <h3 className="font-serif text-lg">New treatment plan</h3>
        <div className="mt-4 grid gap-3">
          <div><Label>Title</Label><Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. CBT for GAD — 12 weeks" /></div>
          <div><Label>Working diagnosis</Label><Input value={dx} onChange={(e) => setDx(e.target.value)} placeholder="e.g. Generalized Anxiety Disorder" /></div>
          <div><Label>Goals (one per line)</Label><Textarea rows={4} value={goals} onChange={(e) => setGoals(e.target.value)} /></div>
          <div><Label>Interventions (one per line)</Label><Textarea rows={4} value={interv} onChange={(e) => setInterv(e.target.value)} /></div>
          <div><Label>Target date</Label><Input type="date" value={target} onChange={(e) => setTarget(e.target.value)} /></div>
          <Button onClick={save} className="w-fit">Create plan</Button>
        </div>
      </Card>

      <div className="grid gap-3">
        {plans.map((pl) => (
          <Card key={pl.id} className="p-5">
            <div className="flex justify-between items-start">
              <div>
                <div className="font-serif text-lg">{pl.title}</div>
                {pl.diagnosis && <div className="text-sm text-muted-foreground">{pl.diagnosis}</div>}
              </div>
              <Badge>{pl.status}</Badge>
            </div>
            {Array.isArray(pl.goals) && pl.goals.length > 0 && (
              <div className="mt-3"><div className="text-xs uppercase tracking-wide text-muted-foreground">Goals</div>
                <ul className="list-disc list-inside text-sm mt-1">{pl.goals.map((g: any, i: number) => <li key={i}>{g.goal}</li>)}</ul>
              </div>
            )}
            {Array.isArray(pl.interventions) && pl.interventions.length > 0 && (
              <div className="mt-3"><div className="text-xs uppercase tracking-wide text-muted-foreground">Interventions</div>
                <ul className="list-disc list-inside text-sm mt-1">{pl.interventions.map((g: any, i: number) => <li key={i}>{g.intervention}</li>)}</ul>
              </div>
            )}
            {pl.target_date && <div className="text-xs text-muted-foreground mt-3">Target: {new Date(pl.target_date).toLocaleDateString()}</div>}
          </Card>
        ))}
      </div>
    </div>
  );
}
