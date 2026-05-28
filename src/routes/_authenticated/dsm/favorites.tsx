import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { Card } from "@/components/ui/card";
import { Heart, ChevronLeft } from "lucide-react";

export const Route = createFileRoute("/_authenticated/dsm/favorites")({ component: Favorites });

function Favorites() {
  const { user } = useAuth();
  const [items, setItems] = useState<{ id: string; disorder: { id: string; slug: string; name: string; overview: string } | null }[]>([]);

  useEffect(() => {
    if (!user) return;
    supabase.from("dsm_bookmarks")
      .select("id, disorder:dsm_disorders(id, slug, name, overview)")
      .order("created_at", { ascending: false })
      .then(({ data }) => setItems((data ?? []) as any));
  }, [user]);

  return (
    <div className="container max-w-4xl mx-auto px-6 py-12">
      <Link to="/dsm" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ChevronLeft className="h-4 w-4" /> Library
      </Link>
      <h1 className="font-serif text-4xl mt-4 flex items-center gap-3"><Heart className="h-7 w-7 text-primary" /> Your study list</h1>
      <p className="mt-2 text-muted-foreground">Disorders you've saved for quick reference.</p>

      <div className="mt-8 grid sm:grid-cols-2 gap-3">
        {items.length === 0 ? (
          <Card className="p-8 sm:col-span-2 text-sm text-muted-foreground">
            No favorites yet. Open any disorder and tap the heart to add it here.
          </Card>
        ) : items.map((b) => b.disorder && (
          <Link key={b.id} to="/dsm/disorder/$disorderSlug" params={{ disorderSlug: b.disorder.slug }}>
            <Card className="p-4 h-full hover:shadow-soft transition">
              <h3 className="font-serif text-lg">{b.disorder.name}</h3>
              <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{b.disorder.overview}</p>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
