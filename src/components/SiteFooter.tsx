export function SiteFooter() {
  return (
    <footer className="border-t border-border mt-24 bg-background/50">
      <div className="container mx-auto px-4 py-10 grid gap-6 md:grid-cols-3 text-sm text-muted-foreground">
        <div>
          <div className="font-serif text-lg text-foreground">Mindscape Companion</div>
          <p className="mt-2 max-w-xs">AI-assisted mental wellness, psychology learning, and clinical support — built with safety and clinician oversight at the core.</p>
        </div>
        <div>
          <div className="font-medium text-foreground mb-2">Important</div>
          <p>Not a substitute for diagnosis or treatment by a licensed mental health professional. Clinical framework inspired by DSM-5-TR (APA, 2022).</p>
        </div>
        <div>
          <div className="font-medium text-foreground mb-2">In crisis?</div>
          <p>Call your local emergency number, or visit our <a href="/crisis" className="underline">crisis resources</a> page for international hotlines.</p>
        </div>
      </div>
      <div className="border-t border-border py-4 text-center text-xs text-muted-foreground">© {new Date().getFullYear()} Mindscape Companion</div>
    </footer>
  );
}
