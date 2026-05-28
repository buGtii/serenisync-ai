import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { ArrowLeft, Calendar } from "lucide-react";

export const Route = createFileRoute("/_authenticated/therapists/$therapistId")({ component: Page });

const DAYS = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

function Page() {
  const { therapistId } = Route.useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [t, setT] = useState<any>(null);
  const [avail, setAvail] = useState<any[]>([]);
  const [when, setWhen] = useState("");
  const [msg, setMsg] = useState("");

  useEffect(() => {
    supabase.from("therapist_profiles").select("*").eq("user_id", therapistId).maybeSingle()
      .then(({ data }) => setT(data));
    supabase.from("therapist_availability").select("*").eq("therapist_id", therapistId).order("day_of_week")
      .then(({ data }) => setAvail(data ?? []));
  }, [therapistId]);

  const book = async () => {
    if (!user || !when) return;
    const { data, error } = await supabase.from("bookings").insert({
      therapist_id: therapistId, client_id: user.id,
      scheduled_at: new Date(when).toISOString(),
      message: msg || null,
    }).select().single();
    if (error) return toast.error(error.message);
    toast.success("Booking request sent");
    navigate({ to: "/bookings/$bookingId", params: { bookingId: data.id } });
  };

  if (!t) return <div className="container max-w-3xl mx-auto px-6 py-16 text-muted-foreground">Loading…</div>;

  return (
    <div className="container max-w-4xl mx-auto px-6 py-10">
      <Link to="/therapists" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4 mr-1" /> All therapists
      </Link>

      <div className="mt-4 flex justify-between items-start">
        <div>
          <h1 className="font-serif text-4xl">{t.display_name}</h1>
          {t.headline && <p className="text-muted-foreground mt-1">{t.headline}</p>}
          {t.credentials && <p className="text-xs text-muted-foreground mt-1">{t.credentials}</p>}
        </div>
        {t.hourly_rate_cents && (
          <div className="text-right"><div className="font-serif text-3xl">${(t.hourly_rate_cents/100).toFixed(0)}</div><div className="text-xs text-muted-foreground">{t.currency} per hour</div></div>
        )}
      </div>

      {t.bio && <p className="mt-6 text-sm leading-relaxed whitespace-pre-wrap">{t.bio}</p>}

      <div className="mt-6 flex flex-wrap gap-1.5">
        {t.specialties?.map((s: string) => <Badge key={s} variant="secondary">{s}</Badge>)}
        {t.modalities?.map((s: string) => <Badge key={s} variant="outline">{s}</Badge>)}
      </div>

      <div className="mt-10 grid md:grid-cols-2 gap-6">
        <Card className="p-5">
          <h3 className="font-serif text-xl">Weekly availability</h3>
          {avail.length === 0 ? <p className="text-sm text-muted-foreground mt-3">No availability published.</p> : (
            <ul className="mt-3 text-sm space-y-1">
              {avail.map((a) => (
                <li key={a.id} className="flex justify-between border-b py-1.5">
                  <span>{DAYS[a.day_of_week]}</span>
                  <span className="font-mono text-xs text-muted-foreground">{a.start_time.slice(0,5)} – {a.end_time.slice(0,5)}</span>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card className="p-5">
          <h3 className="font-serif text-xl flex items-center gap-2"><Calendar className="h-5 w-5" /> Request a session</h3>
          <div className="mt-4 grid gap-3">
            <div><Label>Preferred date &amp; time</Label><Input type="datetime-local" value={when} onChange={(e) => setWhen(e.target.value)} /></div>
            <div><Label>Message (optional)</Label><Textarea rows={3} value={msg} onChange={(e) => setMsg(e.target.value)} placeholder="What you'd like support with…" /></div>
            <Button onClick={book} disabled={!when}>Send request</Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
