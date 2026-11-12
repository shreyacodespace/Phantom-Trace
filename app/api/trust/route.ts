import { NextResponse } from "next/server";
import { z } from "zod";
import { issue, verify, sha, REGISTRY } from "@/lib/trust";
import { save } from "@/lib/db";
export const runtime = "nodejs";
const Body = z.discriminatedUnion("action", [
  z.object({ action: z.literal("issue"), issuer: z.string(), subject: z.string().max(80), claims: z.record(z.string().max(120)), days: z.number().min(-30).max(365) }),
  z.object({ action: z.literal("verify"), payload: z.any(), sig: z.string(), disclosed: z.record(z.object({ salt: z.string(), value: z.string() })).optional() }),
  z.object({ action: z.literal("hash"), a: z.string().max(200000), b: z.string().max(200000) }),
]);
export async function POST(req: Request) {
  const p = Body.safeParse(await req.json().catch(() => null));
  if (!p.success) return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  const b = p.data;
  try {
    if (b.action === "issue") return NextResponse.json(issue(b.issuer, b.subject, b.claims, b.days));
    if (b.action === "verify") { const v = verify(b.payload, b.sig, b.disclosed); if (v.event) await save([v.event]); return NextResponse.json(v); }
    const [ha, hb] = [sha(b.a), sha(b.b)];
    return NextResponse.json({ ha, hb, same: ha === hb });
  } catch { return NextResponse.json({ error: "Request failed." }, { status: 400 }); }
}
export const GET = () => NextResponse.json(REGISTRY);
