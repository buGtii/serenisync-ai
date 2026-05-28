import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/wellness")({ component: Wellness });

function Wellness() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [mood, setMood] = useState(5);
  const [energy, setEnergy] = useState(5);
  const [anxiety, setAnxiety] = useState(5);
  const [note, setNote] = useState("");
  const [journal, setJournal] = useState("");

  const { data: recent } = useQuery({
    queryKey: ["mood_logs", user?.id],
    queryFn: async () => {
      const { data } = await supabase.from("mood_logs").select("*").order("created_at", { ascending: false }).limit(7);
      return data ?? [];
    },
    enabled: !!user,
  });

  const saveMood = async () => {
    const { error } = await supabase.from("mood_logs").insert({ user_id: user!.id, mood, energy, anxiety, note: note || null });
    if (error) return toast.error(error.message);
    toast.success("Mood logged");
    setNote("");
    qc.invalidateQueries({ queryKey: ["mood_logs"] });
  };
  const saveJournal = async () => {
    if (!journal.trim()) return;
    const { error } = await supabase.from("journal_entries").insert({ user_id: user!.id, body: journal });
    if (error) return toast.error(error.message);
    toast.success("Saved to your journal");
    setJournal("");
  };

  return (
    <div className="container max-w-4xl mx-auto px-6 py-12 grid md:grid-cols-2 gap-6">
      <Card className="p-6">
        <h2 className="font-serif text-2xl">How are you, right now?</h2>
        <p className="text-sm text-muted-foreground mt-1">Private to you. No diagnoses, just a snapshot.</p>
        <SliderRow label="Mood" value={mood} onChange={setMood} />
        <SliderRow label="Energy" value={energy} onChange={setEnergy} />
        <SliderRow label="Anxiety" value={anxiety} onChange={setAnxiety} />
        <Textarea className="mt-4" placeholder="A short note (optional)" value={note} onChange={(e) => setNote(e.target.value)} />
        <Button className="mt-4 w-full" onClick={saveMood}>Log this check-in</Button>
      </Card>

      <Card className="p-6">
        <h2 className="font-serif text-2xl">Journal</h2>
        <p className="text-sm text-muted-foreground mt-1">Write freely. Encrypted at rest, visible only to you.</p>
        <Textarea className="mt-4 min-h-[180px]" placeholder="What's on your mind?" value={journal} onChange={(e) => setJournal(e.target.value)} />
        <Button className="mt-4 w-full" onClick={saveJournal}>Save entry</Button>
      </Card>

      <Card className="p-6 md:col-span-2">
        <h3 className="font-serif text-xl">Last 7 check-ins</h3>
        {!recent || recent.length === 0 ? <p className="text-sm text-muted-foreground mt-2">No check-ins yet.</p> : (
          <div className="mt-3 grid grid-cols-7 gap-2">
            {recent.slice().reverse().map((r) => (
              <div key={r.id} className="text-center">
                <div className="h-24 rounded-lg bg-secondary flex items-end justify-center p-1">
                  <div className="w-full bg-primary/70 rounded" style={{ height: `${r.mood * 10}%` }} />
                </div>
                <div className="text-xs text-muted-foreground mt-1">{new Date(r.created_at).toLocaleDateString(undefined, { month: "short", day: "numeric" })}</div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

function SliderRow({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  return (
    <div className="mt-5">
      <div className="flex justify-between text-sm"><span>{label}</span><span className="font-mono text-muted-foreground">{value}/10</span></div>
      <Slider className="mt-2" min={1} max={10} step={1} value={[value]} onValueChange={(v) => onChange(v[0])} />
    </div>
  );
}
