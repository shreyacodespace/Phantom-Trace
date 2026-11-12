import { NextResponse } from "next/server";
import { EventSchema } from "@/lib/seed";
import { list } from "@/lib/db";
// Server-side only: the key never reaches the browser. Works with xAI or any OpenAI-compatible provider.
const SYS = "You are a security analyst. Use ONLY the JSON given. Label each statement Observed, Inferred or Hypothesis. Never claim a common attacker or cause. Plain language.";
export async function POST(req: Request) {
  const key = process.env.XAI_API_KEY;
  if (!key) return NextResponse.json({ error: "No AI key set. Add XAI_API_KEY in .env.local or Vercel to enable explanations." }, { status: 503 });
  const body = await req.json().catch(() => null);
  let task: string, data: unknown;
  if (body?.mode === "case") {
    const evs = (await list()).map(({ event_id, module, event_type, entity_id, severity, confidence, impact, timestamp, description }) => ({ event_id, module, event_type, entity_id, severity, confidence, impact, timestamp, description }));
    if (!evs.length) return NextResponse.json({ error: "No findings yet. Load the demo case or run a module first." }, { status: 400 });
    task = "Write an executive summary of this investigation in under 150 words, then list the 3 most urgent actions."; data = evs;
  } else {
    const p = EventSchema.safeParse(body); if (!p.success) return NextResponse.json({ error: "Invalid event payload." }, { status: 400 });
    task = "Explain this finding in under 120 words."; data = p.data;
  }
  const r = await fetch(`${process.env.GROK_BASE_URL || "https://api.x.ai/v1"}/chat/completions`, {
    method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
    body: JSON.stringify({ model: process.env.GROK_MODEL || "grok-4", temperature: 0.2, messages: [{ role: "system", content: SYS }, { role: "user", content: `${task}\n${JSON.stringify(data)}` }] }),
  });
  if (!r.ok) return NextResponse.json({ error: `AI provider error ${r.status}. Check the key, model name and base URL.` }, { status: 502 });
  return NextResponse.json({ text: (await r.json()).choices?.[0]?.message?.content ?? "" });
}
