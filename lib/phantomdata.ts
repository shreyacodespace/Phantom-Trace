import { score, SEV } from "./risk";
// Instrumented test app. Every record is SYNTHETIC. Nothing external is scanned.
export const COMPONENTS = [
  { id: "FORM", name: "Registration form", type: "client" }, { id: "API", name: "Sign-up API", type: "service" },
  { id: "DB", name: "Users database", type: "database" }, { id: "MAIL", name: "Email service", type: "service" },
  { id: "ANALYTICS", name: "Analytics SDK (third party)", type: "third_party" }, { id: "CRM", name: "Support CRM (third party)", type: "third_party" },
];
// fields each link actually carries. API>ANALYTICS forwards the whole payload: the planted bug.
const ALL = ["name", "email", "phone", "city", "plan"];
export const LINKS = [{ from: "FORM", to: "API", fields: ALL }, { from: "API", to: "DB", fields: ALL }, { from: "API", to: "MAIL", fields: ["name", "email"] },
  { from: "API", to: "ANALYTICS", fields: ALL }, { from: "DB", to: "CRM", fields: ["name", "email", "phone"] }];
export const CATEGORIES = ["email", "phone", "name"] as const;
export const DEFAULT_ALLOW: Record<string, string[]> = { FORM: [...CATEGORIES], API: [...CATEGORIES], DB: [...CATEGORIES], MAIL: ["email", "name"], ANALYTICS: [], CRM: [...CATEGORIES] };
const RECORDS = [
  { name: "Asha Verma (synthetic)", email: "asha.v@example.test", phone: "98100 00001", city: "Delhi", plan: "free" },
  { name: "Rohan Iyer (synthetic)", email: "rohan.i@example.test", phone: "98100 00002", city: "Pune", plan: "pro" },
  { name: "Meera Das (synthetic)", email: "meera.d@example.test", phone: "98100 00003", city: "Kolkata", plan: "free" },
];
const NAME_FIELDS = ["name"]; // names have no reliable pattern, so they are detected by configured field name only
const MASK = (v: string) => v[0] + "••••••" + v.slice(-1);
function detect(field: string, v: string): { cat: string; by: "pattern" | "field-name" } | null {
  if (v.includes("•")) return null;
  if (/^[^@\s]+@[^@\s]+\.[a-z]{2,}$/i.test(v)) return { cat: "email", by: "pattern" };
  if (/^(?:\+91[\s-]?)?[6-9]\d{4}[\s-]?\d{5}$/.test(v)) return { cat: "phone", by: "pattern" };
  if (NAME_FIELDS.includes(field)) return { cat: "name", by: "field-name" };
  return null;
}
const SEVERITY: Record<string, { s: keyof typeof SEV; i: number }> = { phone: { s: "HIGH", i: 0.8 }, email: { s: "MEDIUM", i: 0.6 }, name: { s: "LOW", i: 0.4 } };
export function simulate(allow: Record<string, string[]> = DEFAULT_ALLOW, maskLinks: string[] = []) {
  const flows: any[] = [];
  RECORDS.forEach((rec, ri) => LINKS.forEach((l) => l.fields.forEach((f) => {
    const raw = (rec as any)[f] as string, sentMasked = maskLinks.includes(`${l.from}>${l.to}`) && !!detect(f, raw);
    const sent = sentMasked ? MASK(raw) : raw, d = detect(f, sent);
    flows.push({ flow_id: `FLW-${ri + 1}-${flows.length + 1}`, record: `SYN-00${ri + 1}`, from: l.from, to: l.to, field: f, category: d?.cat ?? null, by: d?.by ?? null, masked: sentMasked,
      allowed: !d || (allow[l.to] ?? []).includes(d.cat), ts: new Date().toISOString() });
  })));
  const groups = new Map<string, any[]>();
  flows.filter((f) => !f.allowed).forEach((f) => { const k = `${f.from}|${f.to}|${f.category}`; groups.set(k, [...(groups.get(k) ?? []), f]); });
  const violations = [...groups.entries()].map(([k, fl], i) => {
    const [from, to, cat] = k.split("|"), c = SEVERITY[cat], conf = fl[0].by === "pattern" ? 0.9 : 0.7;
    const e = { severity: c.s, confidence: conf, impact: c.i };
    return { event_id: `EVT-P-${i + 1}`, module: "PHANTOM_DATA" as const, event_type: "POLICY_VIOLATION_FIELD_TO_UNAUTHORISED", entity_id: to, severity: c.s, confidence: conf, impact: c.i, timestamp: new Date().toISOString(),
      evidence_refs: fl.slice(0, 3).map((x) => x.flow_id), link: `${from}>${to}`, category: cat, records: fl.length,
      description: `${cat} reached ${to} from ${from} in ${fl.length} of ${RECORDS.length} synthetic records. Policy does not allow ${cat} there.`,
      recommended_action: `Drop or mask ${cat} on ${from}>${to}, or update the policy if this flow is intended.`, risk: score(e) };
  });
  const lineage = CATEGORIES.map((cat) => {
    const fld = cat, hops = flows.filter((f) => f.record === "SYN-001" && f.field === fld).map((f) => ({ link: `${f.from}>${f.to}`, masked: f.masked, allowed: f.allowed }));
    const dest = hops.map((h) => h.link.split(">")[1]).filter((t) => !hops.some((h) => h.link.startsWith(t + ">")));
    return { field: fld, origin: "FORM", hops, destinations: dest };
  });
  const bad = new Set(violations.map((v) => v.link));
  return { components: COMPONENTS, flowCount: flows.length, flows: flows.slice(0, 15), violations, lineage,
    graph: { nodes: COMPONENTS.map((c) => ({ id: c.id, label: c.name, type: c.type })), edges: LINKS.map((l) => ({ s: l.from, t: l.to, bad: bad.has(`${l.from}>${l.to}`) })) } };
}
