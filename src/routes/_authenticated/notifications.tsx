import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bell, CheckCheck, Inbox } from "lucide-react";

export const Route = createFileRoute("/_authenticated/notifications")({ component: NotificationsPage });

type Notif = { id: string; kind: string; title: string; body: string | null; link: string | null; read_at: string | null; created_at: string };

function NotificationsPage() {
  const { user } = useAuth();
  const [items, setItems] = useState<Notif[]>([]);

  const load = async () => {
    const { data } = await supabase.from("notifications").select("*").order("created_at", { ascending: false }).limit(100);
    setItems((data ?? []) as Notif[]);
  };

  useEffect(() => {
    if (!user) return;
    load();
    supabase.from("notifications").update({ read_at: new Date().toISOString() }).is("read_at", null).eq("user_id", user.id).then(load);
  }, [user]);

  const markAllRead = async () => {
    if (!user) return;
    await supabase.from("notifications").update({ read_at: new Date().toISOString() }).eq("user_id", user.id).is("read_at", null);
    load();
  };

  return (
    <div className="container max-w-3xl mx-auto px-6 py-12">
      <header className="flex items-end justify-between gap-4">
        <div>
          <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Inbox</div>
          <h1 className="font-serif text-4xl mt-2 flex items-center gap-3"><Bell className="h-7 w-7 text-primary" /> Notifications</h1>
        </div>
        {items.some((i) => !i.read_at) && (
          <Button variant="outline" size="sm" onClick={markAllRead}><CheckCheck className="h-4 w-4 mr-2" /> Mark all read</Button>
        )}
      </header>

      <div className="mt-8 grid gap-3">
        {items.length === 0 ? (
          <Card className="p-10 text-center">
            <Inbox className="h-8 w-8 mx-auto text-muted-foreground" />
            <p className="mt-3 text-sm text-muted-foreground">No notifications yet. We'll alert you when bookings, messages, or verifications change.</p>
          </Card>
        ) : items.map((n) => {
          const body = (
            <Card className={`p-4 transition ${n.read_at ? "opacity-70" : "border-primary/30 bg-primary/5"}`}>
              <div className="flex justify-between gap-3">
                <div>
                  <div className="font-medium text-sm">{n.title}</div>
                  {n.body && <div className="text-sm text-muted-foreground mt-1">{n.body}</div>}
                </div>
                <div className="text-[11px] text-muted-foreground whitespace-nowrap">{new Date(n.created_at).toLocaleString(undefined, { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}</div>
              </div>
            </Card>
          );
          return n.link ? <Link key={n.id} to={n.link as any}>{body}</Link> : <div key={n.id}>{body}</div>;
        })}
      </div>
    </div>
  );
}
