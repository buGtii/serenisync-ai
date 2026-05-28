import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Send, Shield } from "lucide-react";
import ReactMarkdown from "react-markdown";

export const Route = createFileRoute("/_authenticated/chat")({ component: Chat });

function Chat() {
  const [input, setInput] = useState("");
  const { messages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({ api: "/api/chat" }),
  });
  const busy = status === "submitted" || status === "streaming";

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || busy) return;
    await sendMessage({ text: input.trim() });
    setInput("");
  };

  return (
    <div className="container max-w-3xl mx-auto px-6 py-8 flex flex-col h-screen">
      <div className="flex items-center gap-2 text-xs text-muted-foreground"><Shield className="h-3.5 w-3.5" /> Safety screening runs before every response. Not a substitute for professional care.</div>
      <h1 className="font-serif text-3xl mt-2">AI Companion</h1>

      <div className="flex-1 mt-6 space-y-4 overflow-y-auto pb-4">
        {messages.length === 0 && (
          <Card className="p-6 bg-secondary/40 border-dashed">
            <p className="text-sm text-muted-foreground">Share what's on your mind. I'll reflect with you — no diagnoses, just space to think.</p>
          </Card>
        )}
        {messages.map((m) => (
          <div key={m.id} className={m.role === "user" ? "flex justify-end" : "flex justify-start"}>
            <div className={`max-w-[85%] rounded-2xl px-4 py-3 ${m.role === "user" ? "bg-primary text-primary-foreground" : "bg-card border border-border"}`}>
              <div className="prose prose-sm max-w-none">
                <ReactMarkdown>{m.parts.map((p) => (p.type === "text" ? p.text : "")).join("")}</ReactMarkdown>
              </div>
            </div>
          </div>
        ))}
      </div>

      <form onSubmit={submit} className="flex gap-2 pt-4 border-t border-border">
        <Input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Type a message…" disabled={busy} />
        <Button type="submit" size="icon" disabled={busy}><Send className="h-4 w-4" /></Button>
      </form>
    </div>
  );
}
