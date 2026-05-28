import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, BookOpen } from "lucide-react";

type Attempt = {
  id: string;
  created_at: string;
  score: number;
  total: number;
  chapter_id: string | null;
  chapter: { title: string; slug: string; number: number } | null;
};

export const Route = createFileRoute("/_authenticated/dsm/attempts")({ component: Attempts });

function Attempts() {
  const { user } = useAuth();
  const { data, isLoading } = useQuery({
    queryKey: ["quiz_attempts", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("quiz_attempts")
        .select("id,created_at,score,total,chapter_id,chapter:dsm_chapters(title,slug,number)")
        .order("created_at", { ascending: false })
        .limit(50);
      if (error) throw error;
      return (data ?? []) as unknown as Attempt[];
    },
  });

  const attempts = data ?? [];
  const avg = attempts.length
    ? Math.round((attempts.reduce((s, a) => s + a.score / Math.max(a.total, 1), 0) / attempts.length) * 100)
    : 0;

  return (
    <div className="container max-w-3xl mx-auto px-6 py-12">
      <Link to="/dsm" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"><ChevronLeft className="h-4 w-4" /> Library</Link>
      <h1 className="font-serif text-4xl mt-4">Your quiz attempts</h1>
      <p className="mt-2 text-muted-foreground">A private record of your DSM-5-TR practice quizzes.</p>

      {attempts.length > 0 && (
        <Card className="mt-6 p-5 bg-gradient-hero border-primary/20">
          <div className="text-xs uppercase tracking-widest text-muted-foreground">Average score</div>
          <div className="mt-1 font-serif text-3xl">{avg}%</div>
          <div className="text-xs text-muted-foreground mt-1">{attempts.length} attempt{attempts.length === 1 ? "" : "s"} recorded</div>
        </Card>
      )}

      <div className="mt-8 space-y-3">
        {isLoading && <p className="text-sm text-muted-foreground">Loading…</p>}
        {!isLoading && attempts.length === 0 && (
          <Card className="p-6 border-dashed text-sm text-muted-foreground">
            No attempts yet. <Link to="/dsm" className="text-primary underline-offset-2 hover:underline">Pick a chapter</Link> and try a quiz.
          </Card>
        )}
        {attempts.map((a) => {
          const pct = Math.round((a.score / Math.max(a.total, 1)) * 100);
          return (
            <Card key={a.id} className="p-4 flex items-center justify-between gap-4">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-muted-foreground shrink-0" />
                  {a.chapter ? (
                    <Link to="/dsm/$chapterSlug" params={{ chapterSlug: a.chapter.slug }} className="font-medium truncate hover:text-primary">
                      Ch. {a.chapter.number} · {a.chapter.title}
                    </Link>
                  ) : (
                    <span className="font-medium truncate">Chapter quiz</span>
                  )}
                </div>
                <div className="text-xs text-muted-foreground mt-1">{new Date(a.created_at).toLocaleString()}</div>
              </div>
              <div className="text-right shrink-0">
                <div className="font-serif text-xl">{a.score}/{a.total}</div>
                <Badge variant={pct >= 80 ? "default" : pct >= 60 ? "secondary" : "outline"} className="mt-1">{pct}%</Badge>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
