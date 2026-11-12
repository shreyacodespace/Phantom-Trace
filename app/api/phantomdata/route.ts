import { NextResponse } from "next/server";
import { z } from "zod";
import { simulate, DEFAULT_ALLOW } from "@/lib/phantomdata";
import { replaceModule } from "@/lib/db";
const Body = z.object({ allow: z.record(z.array(z.enum(["email", "phone", "name"]))).optional(), maskLinks: z.array(z.string().max(40)).max(10).optional() });
export async function POST(req: Request) {
  const p = Body.safeParse(await req.json().catch(() => ({})));
  if (!p.success) return NextResponse.json({ error: "Invalid policy." }, { status: 400 });
  const out = simulate(p.data.allow ?? DEFAULT_ALLOW, p.data.maskLinks ?? []);
  await replaceModule("PHANTOM_DATA", out.violations);
  return NextResponse.json({ ...out, policy: p.data.allow ?? DEFAULT_ALLOW });
}
