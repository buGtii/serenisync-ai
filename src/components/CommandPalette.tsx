import { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import {
  CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator,
} from "@/components/ui/command";
import { supabase } from "@/integrations/supabase/client";
import {
  LayoutDashboard, BookOpen, HeartPulse, MessageCircle, Users, Calendar, UserCog, Settings, Bell, Heart, BarChart3, Search,
} from "lucide-react";

type Hit = { id: string; name: string; slug: string };

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [hits, setHits] = useState<Hit[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    const term = q.trim();
    if (term.length < 2) { setHits([]); return; }
    let cancelled = false;
    const t = setTimeout(async () => {
      const { data } = await supabase
        .from("dsm_disorders")
        .select("id,name,slug")
        .or(`name.ilike.%${term}%,overview.ilike.%${term}%`)
        .limit(8);
      if (!cancelled) setHits((data ?? []) as Hit[]);
    }, 150);
    return () => { cancelled = true; clearTimeout(t); };
  }, [q]);

  const go = (fn: () => void) => { setOpen(false); setQ(""); setTimeout(fn, 0); };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="hidden md:flex items-center gap-2 text-xs text-muted-foreground border border-border rounded-lg px-3 py-1.5 hover:bg-secondary transition w-full"
      >
        <Search className="h-3.5 w-3.5" />
        <span>Search…</span>
        <span className="ml-auto font-mono text-[10px] border rounded px-1.5 py-0.5">⌘K</span>
      </button>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Search disorders, pages, actions…" value={q} onValueChange={setQ} />
        <CommandList>
          <CommandEmpty>No results. Try another keyword.</CommandEmpty>

          {hits.length > 0 && (
            <CommandGroup heading="DSM disorders">
              {hits.map((h) => (
                <CommandItem key={h.id} value={`disorder-${h.slug}`} onSelect={() => go(() => navigate({ to: "/dsm/disorder/$disorderSlug", params: { disorderSlug: h.slug } }))}>
                  <BookOpen className="h-4 w-4" /> {h.name}
                </CommandItem>
              ))}
            </CommandGroup>
          )}

          <CommandSeparator />
          <CommandGroup heading="Navigate">
            <CommandItem onSelect={() => go(() => navigate({ to: "/dashboard" }))}><LayoutDashboard className="h-4 w-4" /> Dashboard</CommandItem>
            <CommandItem onSelect={() => go(() => navigate({ to: "/dsm" }))}><BookOpen className="h-4 w-4" /> DSM Library</CommandItem>
            <CommandItem onSelect={() => go(() => navigate({ to: "/dsm/favorites" }))}><Heart className="h-4 w-4" /> My DSM favorites</CommandItem>
            <CommandItem onSelect={() => go(() => navigate({ to: "/wellness" }))}><HeartPulse className="h-4 w-4" /> Wellness</CommandItem>
            <CommandItem onSelect={() => go(() => navigate({ to: "/wellness/insights" }))}><BarChart3 className="h-4 w-4" /> Mood insights</CommandItem>
            <CommandItem onSelect={() => go(() => navigate({ to: "/chat" }))}><MessageCircle className="h-4 w-4" /> AI Companion</CommandItem>
            <CommandItem onSelect={() => go(() => navigate({ to: "/therapists" }))}><Users className="h-4 w-4" /> Find a therapist</CommandItem>
            <CommandItem onSelect={() => go(() => navigate({ to: "/bookings" }))}><Calendar className="h-4 w-4" /> Bookings</CommandItem>
            <CommandItem onSelect={() => go(() => navigate({ to: "/clinician" }))}><UserCog className="h-4 w-4" /> Clinician workspace</CommandItem>
            <CommandItem onSelect={() => go(() => navigate({ to: "/notifications" }))}><Bell className="h-4 w-4" /> Notifications</CommandItem>
            <CommandItem onSelect={() => go(() => navigate({ to: "/settings" }))}><Settings className="h-4 w-4" /> Settings</CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  );
}
