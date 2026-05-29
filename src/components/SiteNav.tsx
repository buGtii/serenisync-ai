import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Brain } from "lucide-react";
import { useAuth } from "@/lib/auth";

export function SiteNav() {
  const { user } = useAuth();
  return (
    <header className="sticky top-0 z-40 glass">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 font-serif text-xl">
          <span className="h-9 w-9 rounded-xl bg-gradient-hero flex items-center justify-center shadow-soft">
            <Brain className="h-5 w-5 text-primary" />
          </span>
          PsyDx
        </Link>
        <nav className="hidden md:flex items-center gap-8 text-sm text-muted-foreground">
          <a href="/#features" className="hover:text-foreground">Features</a>
          <a href="/#dsm" className="hover:text-foreground">DSM Learning</a>
          <a href="/#wellness" className="hover:text-foreground">Wellness</a>
          <Link to="/crisis" className="hover:text-foreground">Crisis help</Link>
        </nav>
        <div className="flex items-center gap-2">
          {user ? (
            <Button asChild size="sm"><Link to="/dashboard">Open app</Link></Button>
          ) : (
            <>
              <Button asChild variant="ghost" size="sm"><Link to="/login">Log in</Link></Button>
              <Button asChild size="sm"><Link to="/signup">Get started</Link></Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
