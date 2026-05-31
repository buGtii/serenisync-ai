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
import { ArrowLeft, Loader2 } from "lucide-react";

export const Route = createFileRoute("/signup")({ component: SignUp });

function SignUp() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [role, setRole] = useState<"client" | "student">("student");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  useEffect(() => { if (user) navigate({ to: "/dashboard", replace: true }); }, [user, navigate]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!displayName.trim()) return toast.error("Enter your name");
    if (!/^\S+@\S+\.\S+$/.test(email)) return toast.error("Enter a valid email");
    if (password.length < 6) return toast.error("Password must be at least 6 characters");
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
    setGoogleLoading(true);
    const r = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin + "/dashboard" });
    if (r.error) { setGoogleLoading(false); toast.error(r.error.message ?? "Sign-in failed"); }
  };

  return (
    <div className="min-h-[100dvh] bg-background text-foreground">
      <header className="sticky top-0 z-10 flex h-14 items-center px-3 backdrop-blur">
        <Link to="/" className="inline-flex h-10 w-10 items-center justify-center rounded-full hover:bg-card/60">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div className="ml-1 font-serif text-lg">Create account</div>
      </header>

      <div className="container mx-auto px-5 pb-10 max-w-md">
        <Card className="p-6 border-border/60 bg-card/80 backdrop-blur shadow-soft rounded-2xl">
          <h1 className="font-serif text-3xl">Create your space</h1>
          <p className="text-sm text-muted-foreground mt-1">Free during early access.</p>

          <Button
            variant="outline"
            className="w-full mt-6 h-12 rounded-xl bg-card/60"
            onClick={google}
            type="button"
            disabled={googleLoading}
          >
            {googleLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Continue with Google
          </Button>

          <div className="my-5 flex items-center gap-3 text-xs text-muted-foreground">
            <div className="h-px flex-1 bg-border" /> or <div className="h-px flex-1 bg-border" />
          </div>

          <form onSubmit={submit} className="space-y-4">
            <div>
              <Label>Display name</Label>
              <Input required className="h-12 rounded-xl mt-1" value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
            </div>
            <div>
              <Label>Email</Label>
              <Input type="email" autoComplete="email" inputMode="email" required className="h-12 rounded-xl mt-1" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div>
              <Label>Password</Label>
              <Input type="password" autoComplete="new-password" required minLength={6} className="h-12 rounded-xl mt-1" value={password} onChange={(e) => setPassword(e.target.value)} />
              <p className="text-[11px] text-muted-foreground mt-1">At least 6 characters.</p>
            </div>
            <div>
              <Label>I am a…</Label>
              <Select value={role} onValueChange={(v) => setRole(v as "client" | "student")}>
                <SelectTrigger className="h-12 rounded-xl mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="student">Psychology student</SelectItem>
                  <SelectItem value="client">Someone caring for my wellbeing</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-[11px] text-muted-foreground mt-2">Clinician, researcher, and supervisor accounts require admin approval.</p>
            </div>
            <p className="text-[11px] text-muted-foreground">
              By creating an account you accept our Terms, Privacy Policy, AI Use, and Clinical Disclaimer.
            </p>
            <Button type="submit" className="w-full h-12 rounded-xl text-base" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {loading ? "Creating..." : "Create account"}
            </Button>
          </form>

          <p className="mt-5 text-sm text-center text-muted-foreground">
            Have an account? <Link to="/login" className="text-accent underline-offset-4 hover:underline">Log in</Link>
          </p>
        </Card>
      </div>
    </div>
  );
}
