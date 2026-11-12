import { z } from "zod";
import { score } from "./risk";
// Shared event schema used by every module. ALL DATA BELOW IS SIMULATED (NEXUS Research Labs is fictional).
export const EventSchema = z.object({
  event_id: z.string(), module: z.enum(["AFTERIMAGE", "TRUSTLESS", "PHANTOM_DATA", "DECEPTION_LAB"]),
  event_type: z.string(), entity_id: z.string(), severity: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]),
  confidence: z.number().min(0).max(1), impact: z.number().min(0).max(1), timestamp: z.string().datetime(),
  evidence_refs: z.array(z.string()), description: z.string(), recommended_action: z.string(),
});
export type PEvent = z.infer<typeof EventSchema>;
export const events: PEvent[] = [
  { event_id: "EVT-001", module: "AFTERIMAGE", event_type: "SENSITIVE_METADATA_EXPOSURE", entity_id: "DOC-001", severity: "HIGH", confidence: 0.94, impact: 0.7, timestamp: "2026-11-10T09:12:00Z", evidence_refs: ["EVD-001"], description: "research_brief.pdf carries an author name and internal hostname in its metadata.", recommended_action: "Strip metadata before sharing." },
  { event_id: "EVT-002", module: "TRUSTLESS", event_type: "SIGNATURE_VERIFICATION_FAILED", entity_id: "CRED-007", severity: "CRITICAL", confidence: 0.99, impact: 0.9, timestamp: "2026-11-10T09:31:00Z", evidence_refs: ["EVD-002"], description: "Credential claims issuer NEXUS-CA but Ed25519 signature does not verify against its public key.", recommended_action: "Reject credential and notify issuer." },
  { event_id: "EVT-003", module: "PHANTOM_DATA", event_type: "POLICY_VIOLATION_FIELD_TO_UNAUTHORISED", entity_id: "APP-REG", severity: "HIGH", confidence: 0.88, impact: 0.8, timestamp: "2026-11-10T09:47:00Z", evidence_refs: ["EVD-003"], description: "Field 'phone' flowed from the registration API to an analytics service not allowed by policy.", recommended_action: "Mask the field before the analytics hop." },
  { event_id: "EVT-004", module: "DECEPTION_LAB", event_type: "DECOY_ADMIN_ACCESS_BURST", entity_id: "DECOY-ADMIN", severity: "MEDIUM", confidence: 0.76, impact: 0.5, timestamp: "2026-11-10T10:02:00Z", evidence_refs: ["EVD-004"], description: "14 login attempts on the decoy admin portal within 40 seconds from one test source.", recommended_action: "Review source and add rate limiting." },
].map((e) => EventSchema.parse(e));
export const scored = events.map((e) => ({ ...e, risk: score(e) }));
// Relationship kinds: observed = recorded by a module, inferred = rule-based link, hypothesis = needs human review.
export const nodes = [
  { id: "DOC-001", type: "document" }, { id: "CRED-007", type: "credential" }, { id: "APP-REG", type: "application" },
  { id: "DECOY-ADMIN", type: "decoy" }, { id: "ID-priya.n", type: "identity" }, { id: "NEXUS-CA", type: "issuer" },
  ...events.map((e) => ({ id: e.event_id, type: "event" })),
];
export const edges = [
  ...events.map((e) => ({ s: e.event_id, t: e.entity_id, kind: "observed" })),
  { s: "DOC-001", t: "ID-priya.n", kind: "observed" }, { s: "CRED-007", t: "ID-priya.n", kind: "observed" },
  { s: "CRED-007", t: "NEXUS-CA", kind: "observed" }, { s: "APP-REG", t: "ID-priya.n", kind: "inferred" },
  { s: "DECOY-ADMIN", t: "ID-priya.n", kind: "hypothesis" },
];
