// Signed session cookie (HMAC-SHA256). Auth is ON only when SESSION_SECRET is set, so a first deploy still works.
const te = new TextEncoder();
export const authOn = () => !!process.env.SESSION_SECRET;
const key = (u: "sign" | "verify") => crypto.subtle.importKey("raw", te.encode(process.env.SESSION_SECRET || "x"), { name: "HMAC", hash: "SHA-256" }, false, [u]);
const hex = (b: ArrayBuffer) => [...new Uint8Array(b)].map((x) => x.toString(16).padStart(2, "0")).join("");
export async function sign(role: string, user: string) {
  const body = `${role}.${user}.${Date.now() + 8 * 36e5}`;
  return `${body}.${hex(await crypto.subtle.sign("HMAC", await key("sign"), te.encode(body)))}`;
}
export async function read(tok?: string) {
  const p = tok?.split("."); if (!p || p.length !== 4 || !/^[0-9a-f]{64}$/.test(p[3])) return null;
  const ok = await crypto.subtle.verify("HMAC", await key("verify"), Uint8Array.from(p[3].match(/../g)!, (h) => parseInt(h, 16)), te.encode(p.slice(0, 3).join(".")));
  return ok && +p[2] > Date.now() ? { role: p[0], user: p[1] } : null;
}
