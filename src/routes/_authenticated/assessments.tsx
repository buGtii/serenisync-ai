import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { INSTRUMENTS, scoreInstrument, type Instrument } from "@/lib/assessments";
import { toast } from "sonner";
import { ClipboardCheck } from "lucide-react";

export const Route = createFileRoute("/_authenticated/assessments")({ component: Page });

type Row = { id: string; instrument: string; total_score: number; severity: string | null; created_at: string };

function Page() {
  const { user } = useAuth();
  const [key, setKey] = useState<Instrument["key"]>("PHQ-9");
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [history, setHistory] = useState<Row[]>([]);
  const inst = INSTRUMENTS[key];
  const allAnswered = inst.items.every((i) => answers[i.id] !== undefined);

  const reload = () => {
    if (!user) return;
    supabase.from("assessment_administrations")
      .select("id,instrument,total_score,severity,created_at")
      .eq("client_id", user.id).order("created_at", { ascending: false })
      .then(({ data }) => setHistory((data ?? []) as Row[]));
  };
  useEffect(reload, [user]);

  const save = async () => {
    if (!user) return;
    const { total, severity } = scoreInstrument(key, answers);
    const { error } = await supabase.from("assessment_administrations").insert({
      client_id: user.id, clinician_id: null, instrument: key,
      answers, total_score: total, severity,
    });
    if (error) return toast.error(error.message);
    toast.success(`${key}: ${total} (${severity})`);
    setAnswers({}); reload();
  };

  return (
    <div className="container max-w-3xl mx-auto px-6 py-12">
      <div className="flex items-center gap-3">
        <ClipboardCheck className="h-6 w-6 text-primary" />
        <h1 className="font-serif text-4xl">Self-assessments</h1>
      </div>
      <p className="mt-2 text-muted-foreground">
        Validated screeners (PHQ-9, GAD-7, PCL-5). Educational use — not a diagnosis. If you are in crisis, see{" "}
        <Link to="/crisis" className="underline">crisis resources</Link>.
      </p>

      <Card className="p-6 mt-8">
        <div className="flex items-center gap-3">
          <Label>Instrument</Label>
          <Select value={key} onValueChange={(v) => { setKey(v as Instrument["key"]); setAnswers({}); }}>
            <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
            <SelectContent>
              {Object.keys(INSTRUMENTS).map((k) => <SelectItem key={k} value={k}>{k}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <p className="mt-3 text-sm text-muted-foreground">{inst.description}</p>
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

      <div className="mt-10">
        <h2 className="font-serif text-xl mb-4">Your history</h2>
        {history.length === 0 ? <p className="text-sm text-muted-foreground">No results yet.</p> : (
          <div className="grid gap-3">
            {history.map((r) => (
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
        )}
      </div>
    </div>
  );
}
