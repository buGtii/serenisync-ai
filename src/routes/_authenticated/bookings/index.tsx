import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "lucide-react";

export const Route = createFileRoute("/_authenticated/bookings/")({ component: Page });

type B = { id: string; therapist_id: string; client_id: string; scheduled_at: string; status: string; message: string | null };

function Page() {
  const { user } = useAuth();
  const [list, setList] = useState<B[]>([]);

  useEffect(() => {
    if (!user) return;
    supabase.from("bookings").select("*")
      .or(`client_id.eq.${user.id},therapist_id.eq.${user.id}`)
      .order("scheduled_at", { ascending: false })
      .then(({ data }) => setList((data ?? []) as B[]));
  }, [user]);

  return (
    <div className="container max-w-3xl mx-auto px-6 py-12">
      <div className="flex items-center gap-3">
        <Calendar className="h-6 w-6 text-primary" />
        <h1 className="font-serif text-4xl">Your bookings</h1>
      </div>
      <div className="mt-8 grid gap-3">
        {list.length === 0 ? (
          <p className="text-sm text-muted-foreground">No bookings yet. <Link to="/therapists" className="underline">Find a therapist</Link>.</p>
        ) : list.map((b) => (
          <Link key={b.id} to="/bookings/$bookingId" params={{ bookingId: b.id }}>
            <Card className="p-4 flex justify-between items-center hover:shadow-soft transition">
              <div>
                <div className="font-medium">{new Date(b.scheduled_at).toLocaleString()}</div>
                <div className="text-xs text-muted-foreground mt-1">{user?.id === b.client_id ? "With therapist" : "From client"} · {b.therapist_id === user?.id ? b.client_id : b.therapist_id}</div>
              </div>
              <Badge variant={b.status === "confirmed" ? "default" : "secondary"}>{b.status}</Badge>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
