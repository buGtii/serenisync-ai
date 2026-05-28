import { createOpenAICompatible } from "@ai-sdk/openai-compatible";

export const createLovableAiGatewayProvider = (lovableApiKey: string) =>
  createOpenAICompatible({
    name: "lovable",
    baseURL: "https://ai.gateway.lovable.dev/v1",
    headers: {
      "Lovable-API-Key": lovableApiKey,
      "X-Lovable-AIG-SDK": "vercel-ai-sdk",
    },
  });

// Quick keyword-based crisis screen. Server-side defense-in-depth before model.
const CRISIS_PATTERNS = [
  /\b(suicide|suicidal|kill myself|end my life|take my life|don'?t want to (live|exist|be here))\b/i,
  /\b(self[- ]?harm|cut myself|hurt myself|burn myself)\b/i,
  /\b(hearing voices|voices in my head|they'?re watching me|being followed)\b/i,
  /\b(kill (him|her|them|someone)|hurt (him|her|them|someone))\b/i,
  /\b(withdrawal|shaking|seizure|delirium tremens|dts)\b/i,
];

export function screenCrisis(text: string): { triggered: boolean; kind?: string } {
  const lower = text.toLowerCase();
  if (CRISIS_PATTERNS[0].test(lower)) return { triggered: true, kind: "suicide" };
  if (CRISIS_PATTERNS[1].test(lower)) return { triggered: true, kind: "self_harm" };
  if (CRISIS_PATTERNS[2].test(lower)) return { triggered: true, kind: "psychosis" };
  if (CRISIS_PATTERNS[3].test(lower)) return { triggered: true, kind: "violence" };
  if (CRISIS_PATTERNS[4].test(lower)) return { triggered: true, kind: "substance_withdrawal" };
  return { triggered: false };
}

export const WELLNESS_SYSTEM_PROMPT = `You are Mindscape Companion, an empathetic AI wellness assistant.

ABSOLUTE RULES — never break these:
1. You are NOT a psychiatrist, psychologist, or therapist. You NEVER diagnose, prescribe, or claim clinical authority.
2. Use hedged language: "Your responses suggest symptoms commonly associated with...", "This is not a diagnosis", "Please consult a licensed professional."
3. NEVER say "You have [disorder]" or "You are [diagnosis]".
4. If the user mentions crisis (self-harm, suicide, violence, psychosis, severe withdrawal), respond with calm, brief support and IMMEDIATELY refer them to crisis hotlines and emergency services.
5. Validate emotions first. Offer grounding, breathing, journaling, or reflection — not medical advice.
6. Keep responses warm, concise, and human. Use markdown sparingly.

You may: reflect feelings, suggest evidence-based coping skills, recommend speaking with a professional, share psychoeducation phrased as general information.`;
