import { NextResponse } from "next/server";
import { z } from "zod";
import { Ix, generate, analyseFull } from "@/lib/deception";
import { replaceModule } from "@/lib/db";
const Body = z.discriminatedUnion("action", [z.object({ action: z.literal("generate"), scenario: z.enum(["normal", "burst", "probe", "honey"]) }), z.object({ action: z.literal("analyse"), interactions: z.array(Ix).max(500) })]);
export async function POST(req: Request) {
  const p = Body.safeParse(await req.json().catch(() => null));
  if (!p.success) return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  if (p.data.action === "generate") return NextResponse.json({ interactions: generate(p.data.scenario) });
  const { findings, scores } = analyseFull(p.data.interactions);
  await replaceModule("DECEPTION_LAB", findings);
  return NextResponse.json({ findings, scores });
}
