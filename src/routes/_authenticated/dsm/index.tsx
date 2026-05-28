import { createFileRoute, Link } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery, useQuery } from "@tanstack/react-query";
import { useState, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { History, Search } from "lucide-react";

const chaptersQO = queryOptions({
  queryKey: ["dsm_chapters"],
  queryFn: async () => {
    const { data, error } = await supabase.from("dsm_chapters")
      .select("id,slug,number,title,summary,color_hint").order("number");
    if (error) throw error;
    return data;
  },
});

export const Route = createFileRoute("/_authenticated/dsm/")({
  loader: ({ context }) => context.queryClient.ensureQueryData(chaptersQO),
  component: DSMIndex,
});

function DSMIndex() {
  const { data: chapters } = useSuspenseQuery(chaptersQO);
  const [q, setQ] = useState("");
  const term = q.trim();

  const { data: results } = useQuery({
    queryKey: ["dsm_search", term],
    enabled: term.length >= 2,
    queryFn: async () => {
      const like = `%${term}%`;
      const { data, error } = await supabase
        .from("dsm_disorders")
        .select("id,slug,name,overview,chapter_id")
        .or(`name.ilike.${like},overview.ilike.${like}`)
        .limit(30);
      if (error) throw error;
      return data ?? [];
    },
  });

  const chapterMap = useMemo(() => Object.fromEntries(chapters.map((c) => [c.id, c])), [chapters]);

  return (
    <div className="container max-w-5xl mx-auto px-6 py-12">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-xs uppercase tracking-widest text-muted-foreground">DSM-5-TR Library</div>
          <h1 className="font-serif text-4xl mt-2">All 20 chapters</h1>
          <p className="mt-2 text-muted-foreground max-w-2xl">Structured, paraphrased summaries with practice quizzes. Verbatim APA text is never stored — these are educational frameworks.</p>
        </div>
        <Link to="/dsm/attempts" className="hidden sm:inline-flex shrink-0 items-center gap-2 text-sm text-muted-foreground hover:text-foreground border border-border rounded-lg px-3 py-2">
          <History className="h-4 w-4" /> My attempts
        </Link>
      </div>

      <div className="mt-8 relative">
        <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={q} onChange={(e) => setQ(e.target.value)}
          placeholder="Search disorders by name, symptom, or keyword…"
          className="pl-10 h-12"
        />
      </div>

      {term.length >= 2 ? (
        <div className="mt-6">
          <div className="text-xs uppercase tracking-widest text-muted-foreground mb-3">
            {results ? `${results.length} result${results.length === 1 ? "" : "s"}` : "Searching…"}
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            {(results ?? []).map((r) => (
              <Link key={r.id} to="/dsm/disorder/$disorderSlug" params={{ disorderSlug: r.slug }}>
                <Card className="p-4 h-full hover:shadow-soft transition">
                  <div className="text-xs text-muted-foreground">{chapterMap[r.chapter_id]?.title}</div>
                  <h3 className="font-serif text-lg mt-0.5">{r.name}</h3>
                  <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{r.overview}</p>
                </Card>
              </Link>
            ))}
            {results && results.length === 0 && (
              <Card className="p-6 sm:col-span-2 text-sm text-muted-foreground">No matches. Try a chapter below.</Card>
            )}
          </div>
        </div>
      ) : (
        <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {chapters.map((c) => (
            <Link key={c.id} to="/dsm/$chapterSlug" params={{ chapterSlug: c.slug }}>
              <Card className="p-5 h-full hover:shadow-soft transition">
                <div className="text-xs text-muted-foreground">Chapter {c.number}</div>
                <h3 className="font-serif text-xl mt-1">{c.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground line-clamp-3">{c.summary}</p>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
