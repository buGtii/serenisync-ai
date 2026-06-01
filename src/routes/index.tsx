import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/lib/auth";
import {
  Brain, BookOpen, HeartPulse, Shield, Sparkles, ArrowRight, LayoutGrid,
} from "lucide-react";

export const Route = createFileRoute("/")({ component: Landing });

function Landing() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  // If already signed in, jump straight into the app — landing is only for guests.
  useEffect(() => {
    if (!loading && user) navigate({ to: "/dashboard", replace: true });
  }, [loading, user, navigate]);

  return (
    <div className="min-h-[100dvh] bg-background text-foreground flex flex-col">
      <header
        className="sticky top-0 z-30 px-5 py-3 backdrop-blur bg-background/80 border-b border-border/40"
        style={{ paddingTop: "calc(env(safe-area-inset-top) + 0.75rem)" }}
      >
        <div className="flex items-center gap-2 font-serif text-lg">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-hero">
            <Brain className="h-5 w-5 text-primary" />
          </span>
          PsyDx
        </div>
      </header>

      <main className="flex-1 px-5 pt-6 pb-10 max-w-2xl w-full mx-auto">
        <div className="rounded-3xl border border-border/60 bg-gradient-hero p-6 shadow-glow">
          <div className="inline-flex items-center gap-2 rounded-full bg-card/60 px-3 py-1 text-[11px] font-medium text-foreground/80 backdrop-blur">
            <Sparkles className="h-3.5 w-3.5 text-accent" />
            AI-assisted · Clinician-supervised
          </div>
          <h1 className="font-serif text-4xl text-foreground leading-[1.05] mt-5">
            A calmer way to learn,
            <br />
            <em className="text-accent not-italic font-medium">reflect, and care.</em>
          </h1>
          <p className="mt-4 text-sm text-muted-foreground">
            DSM-5-TR learning, wellness toolkit, and clinical support — built for mobile.
          </p>

          <div className="mt-6 flex flex-col gap-3">
            <Button asChild size="lg" className="h-12 rounded-2xl text-base shadow-soft">
              <Link to="/signup">
                Get started <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="h-12 rounded-2xl text-base bg-card/40 backdrop-blur">
              <Link to="/login">Log in</Link>
            </Button>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3">
          {[
            { icon: BookOpen, title: "DSM Library", body: "All 20 chapters" },
            { icon: LayoutGrid, title: "Tools", body: "Wellness & assess" },
            { icon: HeartPulse, title: "Reflection", body: "Mood & journal" },
            { icon: Shield, title: "Crisis help", body: "One-tap hotlines" },
          ].map((t) => (
            <Card key={t.title} className="p-4 border-border/60 bg-card/70 backdrop-blur">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-primary/15 text-primary">
                <t.icon className="h-5 w-5" />
              </span>
              <div className="mt-3 font-serif text-base leading-tight">{t.title}</div>
              <div className="text-xs text-muted-foreground">{t.body}</div>
            </Card>
          ))}
        </div>

        <p className="mt-8 text-center text-[11px] text-muted-foreground px-4">
          Not a substitute for diagnosis or treatment by a licensed professional.
        </p>
      </main>
    </div>
  );
}
