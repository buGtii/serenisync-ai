import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { SiteNav } from "@/components/SiteNav";

export const Route = createFileRoute("/signup")({ component: SignUp });

function SignUp() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [role, setRole] = useState<"client" | "student">("student");
  const [loading, setLoading] = useState(false);

  useEffect(() => { if (user) navigate({ to: "/dashboard", replace: true }); }, [user, navigate]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email, password,
      options: {
        emailRedirectTo: `${window.location.origin}/dashboard`,
        data: { display_name: displayName, role },
      },
    });
    setLoading(false);
    if (error) return toast.error(error.message);
    toast.success("Check your email to confirm your account.");
  };

  const google = async () => {
    const r = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin + "/dashboard" });
    if (r.error) toast.error(r.error.message ?? "Sign-in failed");
  };

  return (
    <div className="min-h-screen">
      <SiteNav />
      <div className="container mx-auto px-4 py-16 max-w-md">
        <Card className="p-8 shadow-soft">
          <h1 className="font-serif text-3xl">Create your space</h1>
          <p className="text-sm text-muted-foreground mt-1">Free during early access.</p>
          <Button variant="outline" className="w-full mt-6" onClick={google} type="button">Continue with Google</Button>
          <div className="my-5 text-center text-xs text-muted-foreground">or</div>
          <form onSubmit={submit} className="space-y-4">
            <div><Label>Display name</Label><Input required value={displayName} onChange={(e) => setDisplayName(e.target.value)} /></div>
            <div><Label>Email</Label><Input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} /></div>
            <div><Label>Password</Label><Input type="password" required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} /></div>
            <div>
              <Label>I am a…</Label>
              <Select value={role} onValueChange={(v) => setRole(v as "client" | "student")}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="student">Psychology student</SelectItem>
                  <SelectItem value="client">Someone caring for my wellbeing</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground mt-2">Clinician, researcher, and supervisor accounts require admin approval and are coming soon.</p>
            </div>
            <p className="text-xs text-muted-foreground">By creating an account you accept our Terms, Privacy Policy, AI Use, and Clinical Disclaimer.</p>
            <Button type="submit" className="w-full" disabled={loading}>{loading ? "Creating..." : "Create account"}</Button>
          </form>
          <p className="mt-4 text-sm text-center text-muted-foreground">Have an account? <Link to="/login" className="text-foreground underline">Log in</Link></p>
        </Card>
      </div>
    </div>
  );
}
