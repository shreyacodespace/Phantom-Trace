import { z } from "zod";
import { score } from "./risk";
import { mlScore, ML_THRESHOLD } from "./ml";
// Isolated decoy. Nothing here touches a real system. Passwords typed into the decoy are never read or stored.
export const HONEYFILE = "/backup/db_dump.sql";
export const Ix = z.object({ id: z.string().max(24), ts: z.string().datetime(), source: z.string().max(20), type: z.enum(["page_view", "login_attempt", "file_access", "path_probe"]), resource: z.string().max(80), status: z.enum(["200", "401", "403", "404"]) });
export type Ix = z.infer<typeof Ix>;
export function generate(s: string): Ix[] {
  const base = Date.now() - 5 * 60e3; let n = 0; const mk = (source: string, type: Ix["type"], resource: string, status: Ix["status"], off: number): Ix => ({ id: `IX-${s.slice(0, 2)}${++n}`, ts: new Date(base + off * 1e3).toISOString(), source, type, resource, status });
  if (s === "burst") return Array.from({ length: 14 }, (_, i) => mk("SRC-B7", "login_attempt", "/admin-portal", "401", i * 3));
  if (s === "probe") return ["/.env", "/wp-admin", "/phpmyadmin", "/config.php", "/.git/config", "/backup.zip"].map((p, i) => mk("SRC-P3", "path_probe", p, "404", i * 4));
  if (s === "honey") return [mk("SRC-H2", "page_view", "/admin-portal", "200", 0), mk("SRC-H2", "file_access", HONEYFILE, "200", 20)];
  return [mk("SRC-N1", "page_view", "/admin-portal", "200", 0), mk("SRC-N1", "login_attempt", "/admin-portal", "401", 15)];
}
// Rules, thresholds and confidence formulas are fixed and shown to the user. No ML: there is not enough data to train one.
export const analyse = (a: Ix[]) => analyseFull(a).findings;
export function analyseFull(all: Ix[]) {
  const scores: any[] = [];
  const by = new Map<string, Ix[]>(); [...all].sort((a, b) => a.ts.localeCompare(b.ts)).forEach((x) => by.set(x.source, [...(by.get(x.source) ?? []), x]));
  const out: any[] = []; const t = (x: Ix) => Date.parse(x.ts);
  const add = (src: string, rule: string, ev: Ix[], sev: "LOW" | "MEDIUM" | "HIGH", conf: number, imp: number, why: string, act: string) => {
    const e = { severity: sev, confidence: Math.round(conf * 100) / 100, impact: imp };
    out.push({ event_id: `EVT-D-${out.length + 1}`, module: "DECEPTION_LAB" as const, event_type: rule, entity_id: src, ...e, timestamp: new Date(t(ev[ev.length - 1])).toISOString(), evidence_refs: ev.slice(0, 4).map((x) => x.id), description: why, recommended_action: act, risk: score(e) });
  };
  for (const [src, xs] of by) {
    const L = xs.filter((x) => x.type === "login_attempt"); let best: Ix[] = [];
    L.forEach((x, i) => { const w = L.filter((y, j) => j >= i && t(y) - t(x) <= 60e3); if (w.length > best.length) best = w; });
    if (best.length >= 5) add(src, "LOGIN_BURST", best, best.length >= 10 ? "HIGH" : "MEDIUM", Math.min(0.95, 0.75 + 0.02 * (best.length - 5)), 0.5, `Rule LOGIN_BURST: ${best.length} login attempts on the decoy portal within 60 seconds (threshold 5).`, "Rate-limit the real login and review this source in your logs.");
    const H = xs.filter((x) => x.resource === HONEYFILE);
    if (H.length) add(src, "HONEYFILE_ACCESS", H, "HIGH", 0.9, 0.8, `Rule HONEYFILE_ACCESS: ${HONEYFILE} was requested. No legitimate user is ever pointed at it.`, "Treat as reconnaissance. Check whether this source touched real backup paths.");
    const P = xs.filter((x) => x.type === "path_probe"); let pb: Ix[] = [];
    P.forEach((x, i) => { const w = P.filter((y, j) => j >= i && t(y) - t(x) <= 30e3); if (new Set(w.map((y) => y.resource)).size > new Set(pb.map((y) => y.resource)).size) pb = w; });
    const d = new Set(pb.map((y) => y.resource)).size;
    if (d >= 4) add(src, "PATH_PROBING", pb, "MEDIUM", Math.min(0.9, 0.7 + 0.05 * (d - 4)), 0.4, `Rule PATH_PROBING: ${d} different unlisted paths requested within 30 seconds (threshold 4).`, "Block the source at the edge and confirm none of these paths exist in production.");
    const m = mlScore(xs); scores.push({ source: src, ...m, rules: out.filter((o) => o.entity_id === src).length });
    if (m.score >= ML_THRESHOLD && !out.some((o) => o.entity_id === src)) add(src, "ML_ANOMALY", xs, "MEDIUM", Math.min(0.9, m.score), 0.4, `ML anomaly: unusual ${m.top} (${m.value}) for this source, isolation score ${m.score}. No fixed rule fired.`, "Review this source's raw log.");
  }
  return { findings: out, scores };
}
