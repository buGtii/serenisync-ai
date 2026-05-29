import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { ClipboardList, Plus, ShieldAlert } from "lucide-react";

export const Route = createFileRoute("/_authenticated/clinician/assessment/")({
  component: Page,
});

type Row = {
  id: string;
  client_id: string;
  title: string;
  status: string;
  severity: string | null;
  updated_at: string;
};

function Page() {
  const { user, roles, loading } = useAuth();
  const navigate = useNavigate();
  const isClinician = roles.includes("clinician") || roles.includes("admin");
  const [rows, setRows] = useState<Row[]>([]);
  const [clientId, setClientId] = useState("");

  useEffect(() => {
    if (!user || !isClinician) return;
    supabase
      .from("clinical_assessments")
      .select("id,client_id,title,status,severity,updated_at")
      .order("updated_at", { ascending: false })
      .then(({ data }) => setRows((data ?? []) as Row[]));
  }, [user, isClinician]);

  if (loading) return null;
  if (!isClinician) return <Gate />;

  const create = async () => {
    if (!user || !clientId.trim()) return toast.error("Enter the client's user ID");
    const { data, error } = await supabase
      .from("clinical_assessments")
      .insert({ clinician_id: user.id, client_id: clientId.trim() })
      .select()
      .single();
    if (error) return toast.error(error.message);
    navigate({ to: "/clinician/assessment/$assessmentId", params: { assessmentId: data.id } });
  };

  return (
    <div className="container max-w-5xl mx-auto px-5 sm:px-6 py-10 sm:py-14 pb-24 md:pb-14">
      <div className="flex items-center gap-3">
        <span className="h-11 w-11 rounded-2xl bg-gradient-hero grid place-items-center">
          <ClipboardList className="h-5 w-5 text-primary" />
        </span>
        <div>
          <h1 className="font-serif text-3xl sm:text-4xl leading-tight">DSM-5 Assessment</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Structured intake → criteria matching. DSM-5-guided; final judgment remains with the clinician.
          </p>
        </div>
      </div>

      <Card className="p-5 sm:p-6 mt-7">
        <h2 className="font-serif text-lg">Start a new assessment</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Paste the client's user ID. The assessment is private to you and the client.
        </p>
        <div className="mt-4 flex flex-col sm:flex-row gap-2">
          <Input
            placeholder="Client user ID (UUID)"
            value={clientId}
            onChange={(e) => setClientId(e.target.value)}
            className="font-mono text-sm"
          />
          <Button onClick={create} className="sm:w-auto">
            <Plus className="h-4 w-4 mr-2" /> Begin
          </Button>
        </div>
      </Card>

      <h2 className="font-serif text-xl mt-10 mb-3">Recent assessments</h2>
      {rows.length === 0 ? (
        <p className="text-sm text-muted-foreground">No assessments yet.</p>
      ) : (
        <div className="grid gap-3">
          {rows.map((r) => (
            <Card
              key={r.id}
              className="p-4 sm:p-5 flex items-center justify-between gap-3 hover:shadow-soft transition cursor-pointer"
              onClick={() =>
                navigate({
                  to: "/clinician/assessment/$assessmentId",
                  params: { assessmentId: r.id },
                })
              }
            >
              <div className="min-w-0">
                <div className="font-medium truncate">{r.title}</div>
                <div className="text-xs text-muted-foreground font-mono truncate">{r.client_id}</div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {r.severity && <Badge variant="outline" className="capitalize">{r.severity}</Badge>}
                <Badge variant={r.status === "complete" ? "default" : "secondary"} className="capitalize">
                  {r.status.replace("_", " ")}
                </Badge>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function Gate() {
  return (
    <div className="container max-w-2xl mx-auto px-6 py-20 text-center">
      <ShieldAlert className="h-10 w-10 text-primary mx-auto" />
      <h1 className="font-serif text-3xl mt-4">Clinicians only</h1>
      <p className="mt-3 text-muted-foreground">
        The DSM-5 assessment workflow is restricted to verified clinicians.
      </p>
      <Button asChild className="mt-6"><Link to="/dashboard">Back to dashboard</Link></Button>
    </div>
  );
}
