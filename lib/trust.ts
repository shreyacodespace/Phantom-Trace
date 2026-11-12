import crypto from "crypto";
import { score } from "./risk";
// DEMO ONLY: issuer keys derive from public seed strings so the demo is reproducible on serverless. Never reuse for real credentials.
const PK8 = Buffer.from("302e020100300506032b657004220420", "hex");
const keyFor = (name: string) => {
  const priv = crypto.createPrivateKey({ key: Buffer.concat([PK8, crypto.createHash("sha256").update("phantom-demo-" + name).digest()]), format: "der", type: "pkcs8" });
  return { priv, pub: crypto.createPublicKey(priv) };
};
export const ISSUERS = ["NEXUS-CA", "IGDTUW-REG", "ROGUE-CA"] as const;
// Trust registry: ROGUE-CA can sign validly but is NOT trusted.
export const REGISTRY = [
  { id: "NEXUS-CA", name: "NEXUS Research Labs CA", status: "trusted" },
  { id: "IGDTUW-REG", name: "Sample University Registrar", status: "trusted" },
] as const;
const trusted = (id: string) => REGISTRY.some((r) => r.id === id);
export const canon = (v: any): string => v && typeof v === "object" ? Array.isArray(v) ? `[${v.map(canon)}]` : `{${Object.keys(v).sort().map((k) => JSON.stringify(k) + ":" + canon(v[k])).join(",")}}` : JSON.stringify(v);
export const sha = (s: string) => crypto.createHash("sha256").update(s).digest("hex");
const commit = (salt: string, k: string, v: string) => sha(`${salt}|${k}|${v}`);
export function issue(issuer: string, subject: string, claims: Record<string, string>, days: number) {
  if (!ISSUERS.includes(issuer as any)) throw new Error("Unknown issuer");
  const disclosures: Record<string, { salt: string; value: string }> = {}, commitments: Record<string, string> = {};
  for (const [k, v] of Object.entries(claims)) { const salt = crypto.randomBytes(8).toString("hex"); disclosures[k] = { salt, value: String(v) }; commitments[k] = commit(salt, k, String(v)); }
  const now = Date.now();
  const payload = { id: "CRED-" + crypto.randomBytes(3).toString("hex"), iss: issuer, sub: subject, iat: new Date(now).toISOString(), exp: new Date(now + days * 864e5).toISOString(), commitments };
  const sig = crypto.sign(null, Buffer.from(canon(payload)), keyFor(issuer).priv).toString("base64");
  return { payload, sig, disclosures };
}
export function verify(payload: any, sig: string, disclosed: Record<string, { salt: string; value: string }> = {}) {
  const checks: { name: string; ok: boolean; detail: string }[] = [];
  const known = ISSUERS.includes(payload?.iss);
  let sigOk = false;
  try { sigOk = known && crypto.verify(null, Buffer.from(canon(payload)), keyFor(payload.iss).pub, Buffer.from(sig, "base64")); } catch {}
  checks.push({ name: "Signature (Ed25519)", ok: sigOk, detail: sigOk ? "Matches issuer public key" : "Does not verify against the issuer's public key" });
  checks.push({ name: "Issuer in trust registry", ok: trusted(payload?.iss), detail: trusted(payload?.iss) ? "Issuer is trusted" : "Issuer is not in the registry" });
  const live = new Date(payload?.exp).getTime() > Date.now();
  checks.push({ name: "Not expired", ok: live, detail: live ? "Within validity period" : "Credential has expired" });
  for (const [k, d] of Object.entries(disclosed)) {
    const ok = payload?.commitments?.[k] === commit(d.salt, k, d.value);
    checks.push({ name: `Disclosed claim "${k}"`, ok, detail: ok ? "Matches signed commitment" : "Does not match signed commitment" });
  }
  const valid = checks.every((c) => c.ok);
  const failedSig = !sigOk;
  const ev = valid ? null : {
    event_id: "EVT-T-" + sha(JSON.stringify(payload) + sig).slice(0, 6), module: "TRUSTLESS" as const,
    event_type: failedSig ? "SIGNATURE_VERIFICATION_FAILED" : !trusted(payload?.iss) ? "UNTRUSTED_ISSUER" : "CREDENTIAL_CHECK_FAILED",
    entity_id: String(payload?.id ?? "UNKNOWN"), severity: failedSig ? ("CRITICAL" as const) : ("HIGH" as const), confidence: 0.99, impact: 0.9,
    timestamp: new Date().toISOString(), evidence_refs: checks.filter((c) => !c.ok).map((c) => c.name),
    description: checks.filter((c) => !c.ok).map((c) => c.detail).join("; "), recommended_action: "Reject the credential and contact the named issuer through a separate channel.",
  };
  return { valid, checks, event: ev && { ...ev, risk: score(ev) } };
}
