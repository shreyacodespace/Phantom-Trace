import { NextResponse } from "next/server";
import { sign } from "@/lib/session";
import { audit } from "@/lib/db";
// Roles: admin may load or reset the workspace. analyst may run modules. Passwords come only from environment variables.
export async function POST(req: Request) {
  const b = await req.json().catch(() => ({}));
  const res = NextResponse.json({ ok: true });
  if (b.logout) { res.cookies.delete("pt_session"); return res; }
  const ip = (req.headers.get("x-forwarded-for") || "local").split(",")[0], g = globalThis as any; g.__rl ??= new Map();
  const tries: number[] = (g.__rl.get(ip) ?? []).filter((t: number) => Date.now() - t < 6e5);
  if (tries.length >= 5) return NextResponse.json({ error: "Too many attempts. Try again in 10 minutes." }, { status: 429 });
  const pw = { admin: process.env.ADMIN_PASSWORD, analyst: process.env.ANALYST_PASSWORD } as Record<string, string | undefined>;
  if (!process.env.SESSION_SECRET || typeof b.username !== "string" || !pw[b.username] || b.password !== pw[b.username]) {
    tries.push(Date.now()); g.__rl.set(ip, tries);
    await audit(String(b.username ?? "?").slice(0, 20), "login_failed");
    return NextResponse.json({ error: "Wrong username or password." }, { status: 401 });
  }
  await audit(b.username, "login");
  res.cookies.set("pt_session", await sign(b.username, b.username), { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", maxAge: 8 * 3600, path: "/" });
  return res;
}
