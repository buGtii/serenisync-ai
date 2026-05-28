import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Users, Plus } from "lucide-react";

export const Route = createFileRoute("/_authenticated/clinician/")({ component: Page });

type Row = { id: string; client_id: string; status: string; notes: string | null; updated_at: string };

function Page() {
  const { user, roles, loading } = useAuth();
  const navigate = useNavigate();
  const [rows, setRows] = useState<Row[]>([]);
  const [clientId, setClientId] = useState("");
  const [notes, setNotes] = useState("");
  const isClinician = roles.includes("clinician") || roles.includes("admin");

  useEffect(() => {
    if (!user) return;
    supabase
      .from("clinician_clients")
      .select("id,client_id,status,notes,updated_at")
      .eq("clinician_id", user.id)
      .order("updated_at", { ascending: false })
      .then(({ data }) => setRows((data ?? []) as Row[]));
  }, [user]);

  if (loading) return null;
  if (!isClinician) {
    return (
      <div className="container max-w-3xl mx-auto px-6 py-16">
        <h1 className="font-serif text-3xl">Clinician toolkit</h1>
        <p className="mt-3 text-muted-foreground">
          This area is for clinicians. Your current role does not have access.
        </p>
        <Button asChild className="mt-6"><Link to="/dashboard">Back to dashboard</Link></Button>
      </div>
    );
  }

  const addClient = async () => {
    if (!user || !clientId.trim()) return;
    const { data, error } = await supabase
      .from("clinician_clients")
      .insert({ clinician_id: user.id, client_id: clientId.trim(), notes: notes || null })
      .select()
      .single();
    if (error) return toast.error(error.message);
    setRows([data as Row, ...rows]);
    setClientId(""); setNotes("");
    toast.success("Client added");
  };

  return (
    <div className="container max-w-5xl mx-auto px-6 py-12">
      <div className="flex items-center gap-3">
        <Users className="h-6 w-6 text-primary" />
        <h1 className="font-serif text-4xl">Clinician toolkit</h1>
      </div>
      <p className="mt-2 text-muted-foreground">Manage your client roster, session notes, assessments, and treatment plans.</p>

      <Card className="p-6 mt-8">
        <h2 className="font-serif text-xl">Add a client</h2>
        <p className="text-sm text-muted-foreground mt-1">Paste the client's user ID (UUID). They must already have an account.</p>
        <div className="mt-4 grid gap-3">
          <Input placeholder="Client user ID" value={clientId} onChange={(e) => setClientId(e.target.value)} />
          <Textarea placeholder="Private notes (optional)" value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} />
          <Button onClick={addClient} className="w-fit"><Plus className="h-4 w-4 mr-2" /> Add to roster</Button>
        </div>
      </Card>

      <div className="mt-10">
        <h2 className="font-serif text-xl mb-4">Your clients</h2>
        {rows.length === 0 ? (
          <p className="text-sm text-muted-foreground">No clients yet.</p>
        ) : (
          <div className="grid gap-3">
            {rows.map((r) => (
              <Card key={r.id} className="p-4 flex items-center justify-between hover:shadow-soft cursor-pointer transition"
                onClick={() => navigate({ to: "/clinician/clients/$clientId", params: { clientId: r.client_id } })}>
                <div>
                  <div className="font-mono text-sm">{r.client_id}</div>
                  {r.notes && <div className="text-xs text-muted-foreground mt-1">{r.notes}</div>}
                </div>
                <Badge variant="secondary">{r.status}</Badge>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
