import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CrisisBanner } from "@/components/CrisisBanner";
import { SiteNav } from "@/components/SiteNav";
import { SiteFooter } from "@/components/SiteFooter";
import { Brain, BookOpen, HeartPulse, Shield, Users, Sparkles, GraduationCap, Activity } from "lucide-react";

export const Route = createFileRoute("/")({ component: Landing });

function Landing() {
  return (
    <div className="min-h-screen">
      <CrisisBanner />
      <SiteNav />

      {/* Hero */}
      <section className="container mx-auto px-4 pt-20 pb-24 text-center max-w-4xl">
        <div className="inline-flex items-center gap-2 rounded-full glass px-4 py-1.5 text-xs text-muted-foreground mb-6">
          <Sparkles className="h-3.5 w-3.5" /> AI-assisted, clinician-supervised
        </div>
        <h1 className="font-serif text-5xl md:text-7xl text-foreground leading-[1.05]">
          A calmer way to learn, reflect,<br />
          <em className="text-primary/80">and care for the mind.</em>
        </h1>
        <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto">
          PsyDx brings together a DSM-5-TR learning engine, a wellness toolkit with safety-first AI, and clinical support — all in one premium mental health platform.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Button asChild size="lg" className="rounded-full px-7"><Link to="/signup">Start free</Link></Button>
          <Button asChild size="lg" variant="outline" className="rounded-full px-7"><a href="#dsm">Explore DSM library</a></Button>
        </div>
        <p className="mt-6 text-xs text-muted-foreground">Not a substitute for diagnosis or treatment by a licensed professional.</p>
      </section>

      {/* Features */}
      <section id="features" className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-3 gap-5">
          {[
            { icon: BookOpen, title: "DSM-5-TR Explorer", body: "All 20 chapters, paraphrased clinical summaries, ICD-10/11 codes, differentials, and assessment tools." },
            { icon: HeartPulse, title: "Wellness toolkit", body: "Mood tracking, journaling, and AI reflection — offline-ready and private to you." },
            { icon: Shield, title: "Crisis-first safety", body: "Every AI message is screened for risk before a response is generated. Hotlines are one tap away." },
            { icon: GraduationCap, title: "Student learning", body: "Quizzes, flashcards, disorder maps, and viva prep for psychology students." },
            { icon: Users, title: "Clinician tools", body: "Approved clinicians get assessment batteries, SOAP notes, and decision support (coming soon)." },
            { icon: Activity, title: "Research analytics", body: "Anonymized cohort analytics with k-anonymity safeguards (coming soon)." },
          ].map((f, i) => (
            <Card key={i} className="p-6 shadow-soft border-border/60 bg-card/80">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-secondary text-secondary-foreground"><f.icon className="h-5 w-5" /></span>
              <h3 className="mt-4 font-serif text-xl">{f.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{f.body}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* DSM section */}
      <section id="dsm" className="container mx-auto px-4 py-20">
        <div className="grid md:grid-cols-2 gap-10 items-center">
          <div>
            <div className="text-xs uppercase tracking-widest text-muted-foreground">DSM-5-TR learning engine</div>
            <h2 className="font-serif text-4xl md:text-5xl mt-3">All 20 chapters. Every category.</h2>
            <p className="mt-4 text-muted-foreground">From Neurodevelopmental to Paraphilic disorders — explore structured, paraphrased summaries with ICD codes, differential diagnoses, comorbidities, and culture/development considerations.</p>
            <p className="mt-3 text-xs text-muted-foreground">Clinical framework inspired by DSM-5-TR (APA, 2022). Verbatim copyrighted text is never stored.</p>
            <div className="mt-6"><Button asChild><Link to="/dsm">Open DSM library</Link></Button></div>
          </div>
          <div className="rounded-2xl bg-gradient-hero p-10 shadow-glow">
            <Brain className="h-12 w-12 text-primary mb-4" />
            <blockquote className="font-serif text-2xl text-primary leading-snug">
              "Your responses suggest symptoms commonly associated with anxiety. This is not a diagnosis — please consult a licensed professional."
            </blockquote>
            <p className="mt-4 text-xs text-primary/70">— Sample AI guardrail. We never diagnose.</p>
          </div>
        </div>
      </section>

      {/* Wellness CTA */}
      <section id="wellness" className="container mx-auto px-4 py-20 text-center max-w-3xl">
        <h2 className="font-serif text-4xl md:text-5xl">Reflection, supported.</h2>
        <p className="mt-4 text-muted-foreground">Track mood, journal privately, and chat with an empathetic assistant that knows when to step back and connect you with help.</p>
        <div className="mt-8"><Button asChild size="lg" className="rounded-full px-7"><Link to="/signup">Create your space</Link></Button></div>
      </section>

      <SiteFooter />
    </div>
  );
}
