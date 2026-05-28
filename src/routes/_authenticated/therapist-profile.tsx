import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";

export const Route = createFileRoute("/_authenticated/therapist-profile")({ component: Page });

const DAYS = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

function Page() {
  const { user, roles, loading } = useAuth();
  const [p, setP] = useState<any>(null);
  const [avail, setAvail] = useState<any[]>([]);
  const [d, setD] = useState({ day_of_week: "1", start_time: "09:00", end_time: "17:00" });

  const isClinician = roles.includes("clinician") || roles.includes("admin");

  useEffect(() => {
    if (!user) return;
    supabase.from("therapist_profiles").select("*").eq("user_id", user.id).maybeSingle()
      .then(({ data }) => setP(data ?? {
        user_id: user.id, display_name: "", headline: "", bio: "",
        specialties: [], modalities: [], languages: ["en"],
        country: "", hourly_rate_cents: null, currency: "USD",
        years_experience: null, credentials: "", accepting_new_clients: true,
      }));
    supabase.from("therapist_availability").select("*").eq("therapist_id", user.id).order("day_of_week")
      .then(({ data }) => setAvail(data ?? []));
  }, [user]);

  if (loading) return null;
  if (!isClinician) {
    return (
      <div className="container max-w-3xl mx-auto px-6 py-16">
        <h1 className="font-serif text-3xl">Therapist profile</h1>
        <p className="mt-3 text-muted-foreground">Only clinicians can create a therapist profile.</p>
        <Button asChild className="mt-6"><Link to="/dashboard">Back to dashboard</Link></Button>
      </div>
    );
  }
  if (!p) return null;

  const save = async () => {
    if (!user) return;
    const payload = { ...p, user_id: user.id };
    const { error } = await supabase.from("therapist_profiles").upsert(payload, { onConflict: "user_id" });
    if (error) return toast.error(error.message);
    toast.success("Profile saved");
  };

  const addSlot = async () => {
    if (!user) return;
    const { data, error } = await supabase.from("therapist_availability").insert({
      therapist_id: user.id,
      day_of_week: parseInt(d.day_of_week), start_time: d.start_time, end_time: d.end_time,
    }).select().single();
    if (error) return toast.error(error.message);
    setAvail([...avail, data]);
  };
  const delSlot = async (id: string) => {
    const { error } = await supabase.from("therapist_availability").delete().eq("id", id);
    if (error) return toast.error(error.message);
    setAvail(avail.filter((a) => a.id !== id));
  };

  const arrField = (k: string) => (p[k] ?? []).join(", ");
  const setArr = (k: string, v: string) => setP({ ...p, [k]: v.split(",").map((s) => s.trim()).filter(Boolean) });

  return (
    <div className="container max-w-4xl mx-auto px-6 py-10">
      <h1 className="font-serif text-4xl">Therapist profile</h1>
      <p className="mt-2 text-muted-foreground">This is what prospective clients see in the marketplace.</p>

      <Card className="p-6 mt-6 grid gap-4">
        <div className="grid md:grid-cols-2 gap-3">
          <div><Label>Display name</Label><Input value={p.display_name ?? ""} onChange={(e) => setP({ ...p, display_name: e.target.value })} /></div>
          <div><Label>Headline</Label><Input value={p.headline ?? ""} onChange={(e) => setP({ ...p, headline: e.target.value })} placeholder="e.g. CBT therapist for anxiety & burnout" /></div>
        </div>
        <div><Label>Bio</Label><Textarea rows={5} value={p.bio ?? ""} onChange={(e) => setP({ ...p, bio: e.target.value })} /></div>
        <div className="grid md:grid-cols-3 gap-3">
          <div><Label>Specialties (comma)</Label><Input value={arrField("specialties")} onChange={(e) => setArr("specialties", e.target.value)} /></div>
          <div><Label>Modalities (comma)</Label><Input value={arrField("modalities")} onChange={(e) => setArr("modalities", e.target.value)} /></div>
          <div><Label>Languages (comma)</Label><Input value={arrField("languages")} onChange={(e) => setArr("languages", e.target.value)} /></div>
        </div>
        <div className="grid md:grid-cols-4 gap-3">
          <div><Label>Country</Label><Input value={p.country ?? ""} onChange={(e) => setP({ ...p, country: e.target.value })} /></div>
          <div><Label>Years experience</Label><Input type="number" value={p.years_experience ?? ""} onChange={(e) => setP({ ...p, years_experience: e.target.value ? parseInt(e.target.value) : null })} /></div>
          <div><Label>Hourly rate (cents)</Label><Input type="number" value={p.hourly_rate_cents ?? ""} onChange={(e) => setP({ ...p, hourly_rate_cents: e.target.value ? parseInt(e.target.value) : null })} /></div>
          <div><Label>Currency</Label><Input value={p.currency ?? "USD"} onChange={(e) => setP({ ...p, currency: e.target.value })} /></div>
        </div>
        <div><Label>Credentials</Label><Input value={p.credentials ?? ""} onChange={(e) => setP({ ...p, credentials: e.target.value })} placeholder="e.g. LCSW, PsyD" /></div>
        <div className="flex items-center gap-3"><Switch checked={p.accepting_new_clients} onCheckedChange={(v) => setP({ ...p, accepting_new_clients: v })} /><Label>Accepting new clients</Label></div>
        <Button onClick={save} className="w-fit">Save profile</Button>
      </Card>

      <Card className="p-6 mt-6">
        <h2 className="font-serif text-xl">Weekly availability</h2>
        <div className="grid grid-cols-4 gap-2 mt-4 items-end">
          <div><Label>Day</Label>
            <Select value={d.day_of_week} onValueChange={(v) => setD({ ...d, day_of_week: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{DAYS.map((day, i) => <SelectItem key={i} value={String(i)}>{day}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div><Label>Start</Label><Input type="time" value={d.start_time} onChange={(e) => setD({ ...d, start_time: e.target.value })} /></div>
          <div><Label>End</Label><Input type="time" value={d.end_time} onChange={(e) => setD({ ...d, end_time: e.target.value })} /></div>
          <Button onClick={addSlot}>Add slot</Button>
        </div>
        <div className="mt-5 grid gap-2">
          {avail.length === 0 ? <p className="text-sm text-muted-foreground">No availability set.</p> : avail.map((a) => (
            <div key={a.id} className="flex justify-between items-center border rounded-lg px-3 py-2">
              <div><Badge variant="secondary">{DAYS[a.day_of_week]}</Badge>
                <span className="ml-3 font-mono text-sm">{a.start_time.slice(0,5)} – {a.end_time.slice(0,5)}</span>
              </div>
              <Button size="icon" variant="ghost" onClick={() => delSlot(a.id)}><Trash2 className="h-4 w-4" /></Button>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
