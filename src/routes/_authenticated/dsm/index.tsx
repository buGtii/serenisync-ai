import { createFileRoute, Link } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { History } from "lucide-react";

const chaptersQO = queryOptions({
  queryKey: ["dsm_chapters"],
  queryFn: async () => {
    const { data, error } = await supabase.from("dsm_chapters").select("id,slug,number,title,summary,color_hint").order("number");
    if (error) throw error;
    return data;
  },
});

export const Route = createFileRoute("/_authenticated/dsm/")({
  loader: ({ context }) => context.queryClient.ensureQueryData(chaptersQO),
  component: DSMIndex,
});

function DSMIndex() {
  const { data } = useSuspenseQuery(chaptersQO);
  return (
    <div className="container max-w-5xl mx-auto px-6 py-12">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-xs uppercase tracking-widest text-muted-foreground">DSM-5-TR Library</div>
          <h1 className="font-serif text-4xl mt-2">All 20 chapters</h1>
          <p className="mt-2 text-muted-foreground max-w-2xl">Structured, paraphrased summaries of every DSM-5-TR chapter with practice quizzes. Verbatim APA text is never stored — these are educational frameworks.</p>
        </div>
        <Link to="/dsm/attempts" className="hidden sm:inline-flex shrink-0 items-center gap-2 text-sm text-muted-foreground hover:text-foreground border border-border rounded-lg px-3 py-2">
          <History className="h-4 w-4" /> My attempts
        </Link>
      </div>
      <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {data.map((c) => (
          <Link key={c.id} to="/dsm/$chapterSlug" params={{ chapterSlug: c.slug }}>
            <Card className="p-5 h-full hover:shadow-soft transition">
              <div className="text-xs text-muted-foreground">Chapter {c.number}</div>
              <h3 className="font-serif text-xl mt-1">{c.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground line-clamp-3">{c.summary}</p>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
