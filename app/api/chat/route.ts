import { streamText } from "ai";

export const runtime = "nodejs";
export const maxDuration = 60;
export const dynamic = "force-dynamic";

const SYSTEM_PROMPT = `You are Lodestar, an analyst persona for a concept-stage AI-native logistics product targeting U.S. Department of Defense sustainment operations.

Constraints:
- All data you reference is synthetic and illustrative. You never invent classified specifics, real unit identifiers, real personnel, or real operational status.
- You ground claims in publicly reported context about DoD logistics (DLA, USTRANSCOM, DIU, GCSS-Army, sustainment programs).
- You present analysis the way a J4/G4 staff officer would expect: numbered options, quantified trade-offs where reasonable, explicit assumptions.
- You make it clear when an estimate is a placeholder versus a defensible public figure.
- You keep responses tight: 250-450 words. No filler.
- You always close with a one-line caveat: "Illustrative analysis on synthetic inputs — not a sustainment-decision aid."
- If the requested locale is "fr", write the entire response in French. Otherwise English.`;

export async function POST(req: Request) {
  if (!process.env.AI_GATEWAY_API_KEY) {
    return new Response("AI_GATEWAY_API_KEY not configured.", { status: 503 });
  }

  let prompt: string;
  let locale: "en" | "fr" = "en";
  try {
    const body = (await req.json()) as { prompt?: unknown; locale?: unknown };
    if (typeof body?.prompt !== "string" || body.prompt.length === 0) {
      return new Response("Missing prompt.", { status: 400 });
    }
    if (body.prompt.length > 4000) {
      return new Response("Prompt too long.", { status: 413 });
    }
    prompt = body.prompt;
    if (body.locale === "fr") locale = "fr";
  } catch {
    return new Response("Invalid JSON.", { status: 400 });
  }

  const model = process.env.LODESTAR_DEMO_MODEL ?? "openai/gpt-4o-mini";

  const result = streamText({
    model,
    system: SYSTEM_PROMPT,
    prompt: `Locale: ${locale}\n\nScenario:\n${prompt}`,
    temperature: 0.5,
  });

  return result.toTextStreamResponse();
}
