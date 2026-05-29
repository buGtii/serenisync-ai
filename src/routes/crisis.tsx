import { createFileRoute } from "@tanstack/react-router";
import { SiteNav } from "@/components/SiteNav";
import { SiteFooter } from "@/components/SiteFooter";
import { Card } from "@/components/ui/card";
import { Phone, Globe } from "lucide-react";

export const Route = createFileRoute("/crisis")({
  head: () => ({ meta: [{ title: "Crisis Resources — PsyDx" }, { name: "description", content: "International crisis hotlines and immediate support resources." }] }),
  component: Crisis,
});

const RESOURCES = [
  { country: "International", name: "Find a Helpline (IASP)", contact: "iasp.info/resources/Crisis_Centres", href: "https://iasp.info/resources/Crisis_Centres/" },
  { country: "United States", name: "988 Suicide & Crisis Lifeline", contact: "Call or text 988", href: "tel:988" },
  { country: "United Kingdom", name: "Samaritans", contact: "116 123", href: "tel:116123" },
  { country: "Pakistan", name: "Umang Helpline", contact: "0311-7786264", href: "tel:03117786264" },
  { country: "India", name: "iCall", contact: "9152987821", href: "tel:9152987821" },
  { country: "Canada", name: "Talk Suicide Canada", contact: "1-833-456-4566", href: "tel:18334564566" },
  { country: "Australia", name: "Lifeline", contact: "13 11 14", href: "tel:131114" },
];

function Crisis() {
  return (
    <div className="min-h-screen">
      <SiteNav />
      <div className="container mx-auto px-4 py-12 max-w-3xl">
        <h1 className="font-serif text-4xl md:text-5xl">You are not alone.</h1>
        <p className="mt-4 text-muted-foreground">If you are in immediate danger, call your local emergency number now. Otherwise, reach out to one of the trained crisis services below — they listen, free and confidential.</p>
        <div className="mt-8 grid gap-3">
          {RESOURCES.map((r) => (
            <a key={r.name} href={r.href} target="_blank" rel="noreferrer">
              <Card className="p-5 hover:shadow-soft transition flex items-center justify-between gap-4">
                <div>
                  <div className="text-xs uppercase tracking-widest text-muted-foreground">{r.country}</div>
                  <div className="font-medium mt-1">{r.name}</div>
                  <div className="text-sm text-muted-foreground">{r.contact}</div>
                </div>
                {r.href.startsWith("tel:") ? <Phone className="h-5 w-5 text-primary" /> : <Globe className="h-5 w-5 text-primary" />}
              </Card>
            </a>
          ))}
        </div>
      </div>
      <SiteFooter />
    </div>
  );
}
