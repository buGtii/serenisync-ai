import { useEffect, useState } from "react";
import { Heart } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export function BookmarkButton({ disorderId }: { disorderId: string }) {
  const { user } = useAuth();
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!user) return;
    supabase.from("dsm_bookmarks").select("id").eq("disorder_id", disorderId).eq("user_id", user.id).maybeSingle()
      .then(({ data }) => setSaved(!!data));
  }, [user, disorderId]);

  const toggle = async () => {
    if (!user) return;
    setBusy(true);
    if (saved) {
      await supabase.from("dsm_bookmarks").delete().eq("disorder_id", disorderId).eq("user_id", user.id);
      setSaved(false); toast.success("Removed from favorites");
    } else {
      await supabase.from("dsm_bookmarks").insert({ disorder_id: disorderId, user_id: user.id });
      setSaved(true); toast.success("Saved to your study list");
    }
    setBusy(false);
  };

  return (
    <Button onClick={toggle} disabled={busy} size="sm" variant={saved ? "default" : "outline"} className="rounded-full">
      <Heart className={`h-4 w-4 ${saved ? "fill-current" : ""}`} /> {saved ? "Saved" : "Save"}
    </Button>
  );
}
