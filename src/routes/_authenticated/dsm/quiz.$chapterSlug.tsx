import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { useState, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, CheckCircle2, XCircle, RotateCw, History } from "lucide-react";
import { toast } from "sonner";

type Choice = { key: string; text: string };
type Question = {
  id: string;
  question: string;
  choices: Choice[];
  correct_key: string;
  explanation: string | null;
  difficulty: number;
};

const quizQO = (slug: string) =>
  queryOptions({
    queryKey: ["dsm_quiz", slug],
    queryFn: async () => {
      const { data: chapter, error: cErr } = await supabase
        .from("dsm_chapters")
        .select("id,number,title,slug")
        .eq("slug", slug)
        .single();
      if (cErr) throw cErr;
      const { data: questions, error: qErr } = await supabase
        .from("dsm_quiz_questions")
        .select("id,question,choices,correct_key,explanation,difficulty")
        .eq("chapter_id", chapter.id);
      if (qErr) throw qErr;
      return { chapter, questions: (questions ?? []) as unknown as Question[] };
    },
  });

export const Route = createFileRoute("/_authenticated/dsm/quiz/$chapterSlug")({
  loader: ({ params, context }) => context.queryClient.ensureQueryData(quizQO(params.chapterSlug)),
  component: Quiz,
});

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function Quiz() {
  const { chapterSlug } = Route.useParams();
  const { data } = useSuspenseQuery(quizQO(chapterSlug));
  const { user } = useAuth();
  const navigate = useNavigate();

  const [seed, setSeed] = useState(0);
  const questions = useMemo(() => shuffle(data.questions), [data.questions, seed]);

  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [saving, setSaving] = useState(false);

  if (questions.length === 0) {
    return (
      <div className="container max-w-2xl mx-auto px-6 py-12">
        <BackLink slug={chapterSlug} />
        <h1 className="font-serif text-3xl mt-4">{data.chapter.title}</h1>
        <Card className="mt-6 p-6 text-sm text-muted-foreground">No quiz questions are available for this chapter yet.</Card>
      </div>
    );
  }

  const total = questions.length;
  const score = submitted
    ? questions.reduce((acc, q) => acc + (answers[q.id] === q.correct_key ? 1 : 0), 0)
    : 0;
  const pct = submitted ? Math.round((score / total) * 100) : 0;

  const submit = async () => {
    if (Object.keys(answers).length < total) {
      toast.error("Answer every question before submitting.");
      return;
    }
    setSubmitted(true);
    if (!user) return;
    setSaving(true);
    try {
      const details = questions.map((q) => ({
        question_id: q.id,
        chosen: answers[q.id],
        correct: q.correct_key,
        is_correct: answers[q.id] === q.correct_key,
      }));
      const sc = details.filter((d) => d.is_correct).length;
      const { error } = await supabase.from("quiz_attempts").insert({
        user_id: user.id,
        chapter_id: data.chapter.id,
        score: sc,
        total,
        details,
      });
      if (error) throw error;
    } catch (e) {
      const message = e instanceof Error ? e.message : "Failed to save attempt";
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  const retake = () => {
    setAnswers({});
    setSubmitted(false);
    setSeed((s) => s + 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="container max-w-2xl mx-auto px-6 py-12">
      <BackLink slug={chapterSlug} />
      <div className="mt-4 flex items-center justify-between">
        <div>
          <div className="text-xs uppercase tracking-widest text-muted-foreground">Chapter {data.chapter.number} · Quiz</div>
          <h1 className="font-serif text-3xl mt-1">{data.chapter.title}</h1>
        </div>
        <Button asChild variant="ghost" size="sm">
          <Link to="/dsm/attempts"><History className="h-4 w-4 mr-2" /> Attempts</Link>
        </Button>
      </div>

      {submitted && (
        <Card className="mt-6 p-6 bg-gradient-hero border-primary/20">
          <div className="text-xs uppercase tracking-widest text-muted-foreground">Result</div>
          <div className="mt-1 font-serif text-3xl">{score} / {total} <span className="text-muted-foreground text-xl">({pct}%)</span></div>
          <div className="mt-4 flex gap-2">
            <Button onClick={retake} variant="outline" size="sm"><RotateCw className="h-4 w-4 mr-2" /> Retake</Button>
            <Button onClick={() => navigate({ to: "/dsm" })} variant="ghost" size="sm">Back to library</Button>
          </div>
          {saving && <div className="mt-3 text-xs text-muted-foreground">Saving attempt…</div>}
        </Card>
      )}

      <div className="mt-8 space-y-6">
        {questions.map((q, i) => {
          const picked = answers[q.id];
          return (
            <Card key={q.id} className="p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="text-xs text-muted-foreground">Question {i + 1} of {total}</div>
                <Badge variant="outline" className="text-[10px]">{q.difficulty === 1 ? "Easy" : q.difficulty === 2 ? "Medium" : "Hard"}</Badge>
              </div>
              <p className="mt-2 font-medium">{q.question}</p>
              <div className="mt-4 space-y-2">
                {q.choices.map((c) => {
                  const isPicked = picked === c.key;
                  const isCorrect = submitted && c.key === q.correct_key;
                  const isWrongPick = submitted && isPicked && c.key !== q.correct_key;
                  return (
                    <button
                      key={c.key}
                      type="button"
                      disabled={submitted}
                      onClick={() => setAnswers((a) => ({ ...a, [q.id]: c.key }))}
                      className={`w-full text-left p-3 rounded-lg border text-sm transition ${
                        isCorrect
                          ? "border-green-500/60 bg-green-500/10"
                          : isWrongPick
                          ? "border-destructive/60 bg-destructive/10"
                          : isPicked
                          ? "border-primary bg-primary/10"
                          : "border-border hover:border-primary/40"
                      }`}
                    >
                      <span className="font-mono text-xs mr-2 text-muted-foreground">{c.key}</span>
                      {c.text}
                      {isCorrect && <CheckCircle2 className="inline h-4 w-4 ml-2 text-green-600" />}
                      {isWrongPick && <XCircle className="inline h-4 w-4 ml-2 text-destructive" />}
                    </button>
                  );
                })}
              </div>
              {submitted && q.explanation && (
                <p className="mt-3 text-xs text-muted-foreground border-l-2 border-primary/40 pl-3">{q.explanation}</p>
              )}
            </Card>
          );
        })}
      </div>

      {!submitted && (
        <div className="mt-8 sticky bottom-4">
          <Button onClick={submit} className="w-full" size="lg">Submit answers</Button>
        </div>
      )}
    </div>
  );
}

function BackLink({ slug }: { slug: string }) {
  return (
    <Link to="/dsm/$chapterSlug" params={{ chapterSlug: slug }} className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground">
      <ChevronLeft className="h-4 w-4" /> Back to chapter
    </Link>
  );
}
