import { NextResponse } from "next/server";
import { list, withRisk, loadSeed, reset, mode, audit } from "@/lib/db";
import { who } from "@/lib/auth";
export const dynamic = "force-dynamic";
export async function GET() { return NextResponse.json({ mode, events: withRisk(await list()) }); }
export async function POST(req: Request) {
  const b = await req.json().catch(() => ({})); const me = await who();
  if (me?.role !== "admin") return NextResponse.json({ error: "Only an admin can load or reset the workspace." }, { status: 403 });
  await audit(me.user, String(b?.action));
  if (b?.action === "seed") await loadSeed(); else if (b?.action === "reset") await reset(); else return NextResponse.json({ error: "Unknown action." }, { status: 400 });
  return NextResponse.json({ mode, events: withRisk(await list()) });
}
