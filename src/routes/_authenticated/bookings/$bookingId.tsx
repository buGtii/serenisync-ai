import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { ArrowLeft, Send } from "lucide-react";

export const Route = createFileRoute("/_authenticated/bookings/$bookingId")({ component: Page });

type Booking = { id: string; therapist_id: string; client_id: string; scheduled_at: string; duration_minutes: number; status: string; message: string | null };
type Msg = { id: string; sender_id: string; body: string; created_at: string };

function Page() {
  const { bookingId } = Route.useParams();
  const { user } = useAuth();
  const [b, setB] = useState<Booking | null>(null);
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [draft, setDraft] = useState("");
  const endRef = useRef<HTMLDivElement>(null);

  const reload = async () => {
    const [{ data: bk }, { data: ms }] = await Promise.all([
      supabase.from("bookings").select("*").eq("id", bookingId).maybeSingle(),
      supabase.from("booking_messages").select("*").eq("booking_id", bookingId).order("created_at"),
    ]);
    setB(bk as Booking | null);
    setMsgs((ms ?? []) as Msg[]);
    setTimeout(() => endRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
  };

  useEffect(() => { reload(); /* eslint-disable-next-line */ }, [bookingId]);

  useEffect(() => {
    const ch = supabase.channel(`bk-${bookingId}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "booking_messages", filter: `booking_id=eq.${bookingId}` },
        (p) => setMsgs((m) => [...m, p.new as Msg]))
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [bookingId]);

  const send = async () => {
    if (!user || !draft.trim()) return;
    const body = draft.trim(); setDraft("");
    const { error } = await supabase.from("booking_messages").insert({
      booking_id: bookingId, sender_id: user.id, body,
    });
    if (error) toast.error(error.message);
  };

  const updateStatus = async (status: string) => {
    const { error } = await supabase.from("bookings").update({ status }).eq("id", bookingId);
    if (error) return toast.error(error.message);
    toast.success(`Marked ${status}`); reload();
  };

  if (!b) return <div className="container max-w-3xl mx-auto px-6 py-16 text-muted-foreground">Loading…</div>;
  const isTherapist = user?.id === b.therapist_id;

  return (
    <div className="container max-w-3xl mx-auto px-6 py-10">
      <Link to="/bookings" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4 mr-1" /> All bookings
      </Link>

      <Card className="p-5 mt-4">
        <div className="flex justify-between items-start">
          <div>
            <div className="font-serif text-2xl">{new Date(b.scheduled_at).toLocaleString()}</div>
            <div className="text-sm text-muted-foreground mt-1">{b.duration_minutes} minutes</div>
            {b.message && <p className="mt-3 text-sm whitespace-pre-wrap">{b.message}</p>}
          </div>
          <Badge>{b.status}</Badge>
        </div>
        {isTherapist && b.status === "pending" && (
          <div className="flex gap-2 mt-4">
            <Button size="sm" onClick={() => updateStatus("confirmed")}>Confirm</Button>
            <Button size="sm" variant="outline" onClick={() => updateStatus("declined")}>Decline</Button>
          </div>
        )}
      </Card>

      <h3 className="font-serif text-xl mt-8">Messages</h3>
      <Card className="p-4 mt-2 h-[400px] overflow-y-auto">
        {msgs.length === 0 ? <p className="text-sm text-muted-foreground">No messages yet.</p> : (
          <div className="space-y-3">
            {msgs.map((m) => {
              const mine = m.sender_id === user?.id;
              return (
                <div key={m.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[75%] rounded-2xl px-3 py-2 text-sm ${mine ? "bg-primary text-primary-foreground" : "bg-secondary"}`}>
                    {m.body}
                    <div className={`text-[10px] mt-1 ${mine ? "text-primary-foreground/70" : "text-muted-foreground"}`}>{new Date(m.created_at).toLocaleTimeString()}</div>
                  </div>
                </div>
              );
            })}
            <div ref={endRef} />
          </div>
        )}
      </Card>

      <form className="mt-3 flex gap-2" onSubmit={(e) => { e.preventDefault(); send(); }}>
        <Input value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="Write a message…" />
        <Button type="submit" disabled={!draft.trim()}><Send className="h-4 w-4" /></Button>
      </form>
    </div>
  );
}
