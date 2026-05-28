import { createFileRoute, Link } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { ChevronLeft } from "lucide-react";

const chapterQO = (slug: string) => queryOptions({
  queryKey: ["dsm_chapter", slug],
  queryFn: async () => {
    const { data: chapter, error } = await supabase.from("dsm_chapters").select("*").eq("slug", slug).single();
    if (error) throw error;
    const { data: disorders } = await supabase.from("dsm_disorders").select("id,slug,name,icd10,overview").eq("chapter_id", chapter.id).order("name");
    return { chapter, disorders: disorders ?? [] };
  },
});

export const Route = createFileRoute("/_authenticated/dsm/$chapterSlug")({
  loader: ({ params, context }) => context.queryClient.ensureQueryData(chapterQO(params.chapterSlug)),
  component: Chapter,
});

function Chapter() {
  const { chapterSlug } = Route.useParams();
  const { data } = useSuspenseQuery(chapterQO(chapterSlug));
  return (
    <div className="container max-w-4xl mx-auto px-6 py-12">
      <Link to="/dsm" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"><ChevronLeft className="h-4 w-4" /> All chapters</Link>
      <div className="mt-4 text-xs uppercase tracking-widest text-muted-foreground">Chapter {data.chapter.number}</div>
      <h1 className="font-serif text-4xl mt-2">{data.chapter.title}</h1>
      <p className="mt-4 text-muted-foreground">{data.chapter.summary}</p>

      <h2 className="font-serif text-2xl mt-10">Disorders in this chapter</h2>
      {data.disorders.length === 0 ? (
        <p className="mt-3 text-sm text-muted-foreground">Detailed disorder entries for this chapter are being added in upcoming releases.</p>
      ) : (
        <div className="mt-4 grid sm:grid-cols-2 gap-3">
          {data.disorders.map((d) => (
            <Link key={d.id} to="/dsm/disorder/$disorderSlug" params={{ disorderSlug: d.slug }}>
              <Card className="p-4 hover:shadow-soft transition h-full">
                <div className="font-medium">{d.name}</div>
                {d.icd10 && <div className="text-xs text-muted-foreground mt-1">ICD-10: {d.icd10}</div>}
                <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{d.overview}</p>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
