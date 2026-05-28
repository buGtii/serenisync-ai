import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { HeartPulse, GraduationCap, Stethoscope, FlaskConical, Check } from "lucide-react";

export const Route = createFileRoute("/_authenticated/onboarding")({ component: Onboarding });

type Intent = "client" | "student" | "clinician" | "researcher";

const OPTIONS: { value: Intent; title: string; body: string; icon: typeof HeartPulse }[] = [
  { value: "client",     title: "I'm here for myself",  body: "Track mood, journal, learn coping tools.",                       icon: HeartPulse },
  { value: "student",    title: "I'm a student",        body: "Study disorders, take quizzes, run case sims.",                  icon: GraduationCap },
  { value: "clinician",  title: "I'm a clinician",      body: "Manage patients, assessments, notes. Needs verification.",        icon: Stethoscope },
  { value: "researcher", title: "I'm a researcher",     body: "Anonymized cohort analytics. Needs verification.",                icon: FlaskConical },
];

function Onboarding() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState<1 | 2>(1);
  const [intent, setIntent] = useState<Intent>("client");
  const [fullName, setFullName] = useState("");
  const [country, setCountry] = useState("");

  // role-specific
  const [clin, setClin] = useState({ specialization: "", license_number: "", license_country: "", years_experience: "", organization: "" });
  const [stu, setStu] = useState({ university: "", degree: "", year: "" });
  const [res, setRes] = useState({ institution: "", field: "", orcid: "" });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    supabase.from("profiles").select("display_name,country,onboarded_at").eq("id", user.id).maybeSingle()
      .then(({ data }) => {
        if (data?.onboarded_at) navigate({ to: "/dashboard", replace: true });
        if (data?.display_name) setFullName(data.display_name);
        if (data?.country) setCountry(data.country);
      });
  }, [user, navigate]);

  const submit = async () => {
    if (!user) return;
    setSaving(true);
    const details =
      intent === "clinician"  ? { clinician_details:  clin } :
      intent === "student"    ? { student_details:    stu  } :
      intent === "researcher" ? { researcher_details: res  } : {};

    const { error } = await supabase.from("profiles").update({
      display_name: fullName,
      country: country.toUpperCase() || null,
      intent_role: intent,
      onboarded_at: new Date().toISOString(),
      ...details,
    }).eq("id", user.id);

    if (error) { setSaving(false); return toast.error(error.message); }

    // role assignments
    if (intent === "client" || intent === "student") {
      await supabase.from("user_roles").upsert({ user_id: user.id, role: intent }, { onConflict: "user_id,role" });
    } else if (intent === "clinician") {
      await supabase.from("clinician_verifications").insert({
        user_id: user.id,
        specialization: clin.specialization,
        license_number: clin.license_number,
        license_country: clin.license_country.toUpperCase() || null,
        years_experience: clin.years_experience ? Number(clin.years_experience) : null,
        organization: clin.organization,
      });
    } else if (intent === "researcher") {
      // pending researcher role; for now grant student-like read access — admin will elevate
    }

    setSaving(false);
    toast.success("You're all set.");
    navigate({ to: "/dashboard", replace: true });
  };

  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <Stepper step={step} />
        {step === 1 ? (
          <Card className="p-8 mt-6 shadow-soft">
            <h1 className="font-serif text-4xl text-center">What brings you here?</h1>
            <div className="mt-8 grid gap-3">
              {OPTIONS.map((o) => {
                const Icon = o.icon;
                const selected = intent === o.value;
                return (
                  <button key={o.value} type="button" onClick={() => setIntent(o.value)}
                    className={`flex items-start gap-4 text-left p-5 rounded-xl border-2 transition ${selected ? "border-primary bg-primary/5" : "border-border hover:border-primary/40"}`}>
                    <span className={`mt-0.5 h-5 w-5 rounded-full border-2 flex items-center justify-center shrink-0 ${selected ? "border-primary bg-primary" : "border-muted-foreground/40"}`}>
                      {selected && <span className="h-2 w-2 rounded-full bg-primary-foreground" />}
                    </span>
                    <Icon className="h-5 w-5 mt-0.5 text-foreground shrink-0" />
                    <div>
                      <div className="font-semibold">{o.title}</div>
                      <div className="text-sm text-muted-foreground mt-0.5">{o.body}</div>
                    </div>
                  </button>
                );
              })}
            </div>
            <Button className="w-full mt-8 h-12" onClick={() => setStep(2)}>Continue</Button>
          </Card>
        ) : (
          <Card className="p-8 mt-6 shadow-soft">
            <h1 className="font-serif text-4xl">About you</h1>
            <div className="mt-6 space-y-5">
              <div>
                <Label>Full name</Label>
                <Input value={fullName} onChange={(e) => setFullName(e.target.value)} className="mt-1.5" />
              </div>
              <div>
                <Label>Country (ISO code, e.g. US, GB, PK)</Label>
                <Input value={country} maxLength={2} onChange={(e) => setCountry(e.target.value)} className="mt-1.5" />
                <p className="text-xs text-muted-foreground mt-1.5">Used to show local crisis lines.</p>
              </div>

              {intent === "clinician" && (
                <DetailsBox title="Clinician details" footer="An admin will verify your credentials before activating clinical features.">
                  <Input placeholder="Specialization (e.g. Clinical Psychology)" value={clin.specialization} onChange={(e) => setClin({ ...clin, specialization: e.target.value })} />
                  <Input placeholder="License number" value={clin.license_number} onChange={(e) => setClin({ ...clin, license_number: e.target.value })} />
                  <Input placeholder="License country (ISO)" maxLength={2} value={clin.license_country} onChange={(e) => setClin({ ...clin, license_country: e.target.value })} />
                  <Input placeholder="Years of experience" type="number" value={clin.years_experience} onChange={(e) => setClin({ ...clin, years_experience: e.target.value })} />
                  <Input placeholder="Clinic / organization" value={clin.organization} onChange={(e) => setClin({ ...clin, organization: e.target.value })} />
                </DetailsBox>
              )}
              {intent === "student" && (
                <DetailsBox title="Student details">
                  <Input placeholder="University" value={stu.university} onChange={(e) => setStu({ ...stu, university: e.target.value })} />
                  <Input placeholder="Degree" value={stu.degree} onChange={(e) => setStu({ ...stu, degree: e.target.value })} />
                  <Input placeholder="Year (1–12)" type="number" min={1} max={12} value={stu.year} onChange={(e) => setStu({ ...stu, year: e.target.value })} />
                </DetailsBox>
              )}
              {intent === "researcher" && (
                <DetailsBox title="Researcher details">
                  <Input placeholder="Institution" value={res.institution} onChange={(e) => setRes({ ...res, institution: e.target.value })} />
                  <Input placeholder="Field of study" value={res.field} onChange={(e) => setRes({ ...res, field: e.target.value })} />
                  <Input placeholder="ORCID (optional)" value={res.orcid} onChange={(e) => setRes({ ...res, orcid: e.target.value })} />
                </DetailsBox>
              )}

              <div className="flex justify-between gap-3 pt-2">
                <Button variant="outline" onClick={() => setStep(1)}>Back</Button>
                <Button onClick={submit} disabled={saving || !fullName.trim()}>{saving ? "Saving…" : "Continue"}</Button>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}

function DetailsBox({ title, footer, children }: { title: string; footer?: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-border bg-muted/30 p-5">
      <div className="font-semibold mb-3">{title}</div>
      <div className="space-y-2.5">{children}</div>
      {footer && <p className="text-xs text-muted-foreground mt-3">{footer}</p>}
    </div>
  );
}

function Stepper({ step }: { step: 1 | 2 }) {
  return (
    <div className="flex items-center justify-center gap-3 text-xs">
      <div className={`flex items-center gap-2 ${step >= 1 ? "text-foreground" : "text-muted-foreground"}`}>
        <span className={`h-6 w-6 rounded-full grid place-items-center text-xs ${step > 1 ? "bg-primary text-primary-foreground" : "bg-secondary"}`}>{step > 1 ? <Check className="h-3.5 w-3.5" /> : "1"}</span>
        Role
      </div>
      <div className="h-px w-10 bg-border" />
      <div className={`flex items-center gap-2 ${step >= 2 ? "text-foreground" : "text-muted-foreground"}`}>
        <span className={`h-6 w-6 rounded-full grid place-items-center text-xs ${step === 2 ? "bg-secondary" : "bg-secondary/50"}`}>2</span>
        About you
      </div>
    </div>
  );
}
