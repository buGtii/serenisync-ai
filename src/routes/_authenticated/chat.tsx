import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Send, Stethoscope, ShieldAlert } from "lucide-react";
import ReactMarkdown from "react-markdown";

export const Route = createFileRoute("/_authenticated/chat")({ component: Chat });

function Chat() {
  const { roles, loading } = useAuth();
  const isClinician = roles.includes("clinician") || roles.includes("admin");
  const [input, setInput] = useState("");
  const { messages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({ api: "/api/chat" }),
  });
  const busy = status === "submitted" || status === "streaming";

  if (loading) return null;
  if (!isClinician) {
    return (
      <div className="container max-w-xl mx-auto px-6 py-20 text-center">
        <ShieldAlert className="h-10 w-10 text-primary mx-auto" />
        <h1 className="font-serif text-3xl mt-4">Case Reasoning Assistant</h1>
        <p className="mt-3 text-muted-foreground">
          The DSM-5 case-reasoning assistant is available to verified clinicians only.
          For wellness support, see the wellness toolkit or crisis resources.
        </p>
        <div className="mt-6 flex gap-2 justify-center">
          <Button asChild><Link to="/wellness">Wellness toolkit</Link></Button>
          <Button asChild variant="outline"><Link to="/crisis">Crisis resources</Link></Button>
        </div>
      </div>
    );
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || busy) return;
    await sendMessage({ text: input.trim() });
    setInput("");
  };

  return (
    <div className="container max-w-3xl mx-auto px-5 sm:px-6 py-6 sm:py-8 flex flex-col h-[100dvh] pb-24 md:pb-8">
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Stethoscope className="h-3.5 w-3.5" /> Clinician case-reasoning · DSM-5-guided · Not autonomous diagnosis
      </div>
      <h1 className="font-serif text-3xl mt-2">Case Reasoning Assistant</h1>
      <p className="text-sm text-muted-foreground mt-1">
        Discuss symptom patterns, differentials, and DSM-5 criteria. Final clinical judgment remains with you.
      </p>

      <div className="flex-1 mt-5 space-y-3 overflow-y-auto pb-4">
        {messages.length === 0 && (
          <Card className="p-5 bg-secondary/40 border-dashed">
            <p className="text-sm text-muted-foreground">
              Describe the presentation (symptoms, onset, duration, impairment). The assistant will help organize
              DSM-5-relevant considerations and possible differentials to review.
            </p>
          </Card>
        )}
        {messages.map((m) => (
          <div key={m.id} className={m.role === "user" ? "flex justify-end" : "flex justify-start"}>
            <div className={`max-w-[88%] rounded-2xl px-4 py-3 ${m.role === "user" ? "bg-primary text-primary-foreground" : "bg-card border border-border"}`}>
              <div className="prose prose-sm max-w-none">
                <ReactMarkdown>{m.parts.map((p) => (p.type === "text" ? p.text : "")).join("")}</ReactMarkdown>
              </div>
            </div>
          </div>
        ))}
      </div>

      <form onSubmit={submit} className="flex gap-2 pt-3 border-t border-border">
        <Input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Describe the presentation…" disabled={busy} />
        <Button type="submit" size="icon" disabled={busy}><Send className="h-4 w-4" /></Button>
      </form>
    </div>
  );
}
