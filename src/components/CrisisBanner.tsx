import { Link } from "@tanstack/react-router";
import { Heart } from "lucide-react";

export function CrisisBanner() {
  return (
    <div className="bg-destructive/10 border-b border-destructive/20 text-sm text-foreground">
      <div className="container mx-auto px-4 py-2 flex items-center justify-center gap-2 flex-wrap text-center">
        <Heart className="h-4 w-4 text-destructive" />
        <span>In crisis or thinking of harming yourself?</span>
        <Link to="/crisis" className="font-medium underline underline-offset-2">Get immediate help →</Link>
      </div>
    </div>
  );
}
