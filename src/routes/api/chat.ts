import { createFileRoute } from "@tanstack/react-router";
import { convertToModelMessages, streamText, type UIMessage } from "ai";
import { createLovableAiGatewayProvider, screenCrisis, WELLNESS_SYSTEM_PROMPT } from "@/lib/ai-gateway.server";

export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const { messages } = (await request.json()) as { messages?: UIMessage[] };
        if (!Array.isArray(messages)) return new Response("Messages required", { status: 400 });

        // Crisis screen on the most recent user message
        const lastUser = [...messages].reverse().find((m) => m.role === "user");
        const userText = lastUser?.parts?.map((p) => (p.type === "text" ? p.text : "")).join(" ") ?? "";
        const crisis = screenCrisis(userText);

        const key = process.env.LOVABLE_API_KEY;
        if (!key) return new Response("AI not configured", { status: 500 });
        const gateway = createLovableAiGatewayProvider(key);
        const model = gateway("google/gemini-2.5-flash");

        const systemPrompt = crisis.triggered
          ? `${WELLNESS_SYSTEM_PROMPT}

CRITICAL: The user just expressed something that suggests possible crisis (type: ${crisis.kind}). Your response MUST:
1. Start with calm, warm validation in 1-2 sentences.
2. Immediately and clearly direct them to crisis support: "Please reach out right now to a crisis line. In the US: call or text 988. International: iasp.info/resources/Crisis_Centres. If you are in immediate danger, call your local emergency number."
3. Encourage them to be with someone they trust if possible.
4. Do not engage in long discussion; safety comes first.`
          : WELLNESS_SYSTEM_PROMPT;

        const result = streamText({
          model,
          system: systemPrompt,
          messages: await convertToModelMessages(messages),
        });
        return result.toUIMessageStreamResponse({ originalMessages: messages });
      },
    },
  },
});
