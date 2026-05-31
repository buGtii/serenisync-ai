import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CrisisBanner } from "@/components/CrisisBanner";
import { SiteNav } from "@/components/SiteNav";
import { SiteFooter } from "@/components/SiteFooter";
import {
  Brain, BookOpen, HeartPulse, Shield, GraduationCap, Sparkles, ArrowRight, Activity,
} from "lucide-react";

export const Route = createFileRoute("/")({ component: Landing });

function Landing() {
  return (
    <div className="min-h-[100dvh] bg-background text-foreground">
      <CrisisBanner />
      <SiteNav />

      {/* Mobile-app hero */}
      <section className="container mx-auto px-5 pt-10 pb-12 max-w-2xl">
        <div className="rounded-3xl border border-border/60 bg-gradient-hero p-6 shadow-glow">
          <div className="inline-flex items-center gap-2 rounded-full bg-card/60 px-3 py-1 text-[11px] font-medium text-foreground/80 backdrop-blur">
            <Sparkles className="h-3.5 w-3.5 text-accent" />
            AI-assisted · Clinician-supervised
          </div>
          <h1 className="font-serif text-4xl sm:text-5xl text-foreground leading-[1.05] mt-5">
            A calmer way to learn,
            <br />
            <em className="text-accent not-italic font-medium">reflect, and care.</em>
          </h1>
          <p className="mt-4 text-sm text-muted-foreground">
            PsyDx pairs a DSM-5-TR learning engine with a safety-first wellness toolkit and clinical support — designed for mobile.
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

          <p className="mt-4 text-[11px] text-muted-foreground">
            Not a substitute for diagnosis or treatment by a licensed professional.
          </p>
        </div>
      </section>

      {/* Quick action tiles — mobile app feel */}
      <section className="container mx-auto px-5 pb-10 max-w-2xl">
        <div className="grid grid-cols-2 gap-3">
          {[
            { to: "/dsm", icon: BookOpen, title: "DSM Library", body: "All 20 chapters" },
            { to: "/wellness", icon: HeartPulse, title: "Wellness", body: "Mood & journal" },
            { to: "/crisis", icon: Shield, title: "Crisis help", body: "One-tap hotlines" },
            { to: "/dashboard", icon: Activity, title: "Dashboard", body: "Your space" },
          ].map((t) => (
            <Link
              key={t.to}
              to={t.to}
              className="group rounded-2xl border border-border/60 bg-card/70 p-4 shadow-soft backdrop-blur transition active:scale-[0.98]"
            >
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-primary/15 text-primary">
                <t.icon className="h-5 w-5" />
              </span>
              <div className="mt-3 font-serif text-lg leading-tight">{t.title}</div>
              <div className="text-xs text-muted-foreground">{t.body}</div>
            </Link>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" className="container mx-auto px-5 py-10 max-w-2xl">
        <h2 className="font-serif text-2xl mb-4">What's inside</h2>
        <div className="grid gap-3">
          {[
            { icon: BookOpen, title: "DSM-5-TR Explorer", body: "Paraphrased clinical summaries, ICD-10/11 codes, differentials, and assessment tools." },
            { icon: HeartPulse, title: "Wellness toolkit", body: "Mood tracking, journaling, and AI reflection — private to you." },
            { icon: Shield, title: "Crisis-first safety", body: "Every AI message is risk-screened. Hotlines are one tap away." },
            { icon: GraduationCap, title: "Student learning", body: "Quizzes, flashcards, disorder maps, and viva prep." },
          ].map((f, i) => (
            <Card key={i} className="p-5 border-border/60 bg-card/70 backdrop-blur">
              <div className="flex items-start gap-3">
                <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent/20 text-accent">
                  <f.icon className="h-5 w-5" />
                </span>
                <div>
                  <h3 className="font-serif text-lg leading-tight">{f.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{f.body}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* DSM quote card */}
      <section id="dsm" className="container mx-auto px-5 py-10 max-w-2xl">
        <Card className="p-6 border-border/60 bg-gradient-hero shadow-glow">
          <Brain className="h-10 w-10 text-accent mb-3" />
          <blockquote className="font-serif text-xl text-foreground leading-snug">
            "Your responses suggest symptoms commonly associated with anxiety. This is not a diagnosis — please consult a licensed professional."
          </blockquote>
          <p className="mt-3 text-[11px] text-muted-foreground">— Sample AI guardrail. We never diagnose.</p>
          <Button asChild className="mt-5 w-full h-11 rounded-xl">
            <Link to="/dsm">Open DSM library</Link>
          </Button>
        </Card>
      </section>

      {/* Bottom CTA */}
      <section id="wellness" className="container mx-auto px-5 py-12 max-w-2xl text-center">
        <h2 className="font-serif text-3xl">Reflection, supported.</h2>
        <p className="mt-3 text-sm text-muted-foreground">
          Track mood, journal privately, and chat with an empathetic assistant that knows when to step back and connect you with help.
        </p>
        <Button asChild size="lg" className="mt-6 h-12 w-full rounded-2xl">
          <Link to="/signup">Create your space</Link>
        </Button>
      </section>

      <SiteFooter />
    </div>
  );
}
