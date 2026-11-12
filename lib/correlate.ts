import type { PEvent } from "./seed";
import type { score } from "./risk";
export type Scored = PEvent & { risk: ReturnType<typeof score> };
const TYPE: Record<string, string> = { AFTERIMAGE: "document", TRUSTLESS: "credential", PHANTOM_DATA: "application", DECEPTION_LAB: "decoy" };
// observed: a module recorded the event on the entity. inferred: events from different modules within 60 minutes of each other.
// Closeness in time is NOT evidence of a shared cause, and the graph labels it that way.
export function buildGraph(evs: PEvent[]) {
  const nodes = new Map<string, { id: string; type: string }>(); const edges: { s: string; t: string; kind: string }[] = []; const seen = new Set<string>();
  for (const e of evs) { nodes.set(e.entity_id, { id: e.entity_id, type: TYPE[e.module] }); nodes.set(e.event_id, { id: e.event_id, type: "event" }); edges.push({ s: e.event_id, t: e.entity_id, kind: "observed" }); }
  for (const a of evs) for (const b of evs) {
    if (a.module >= b.module || a.entity_id === b.entity_id || Math.abs(Date.parse(a.timestamp) - Date.parse(b.timestamp)) > 36e5) continue;
    const k = [a.entity_id, b.entity_id].sort().join("|"); if (!seen.has(k)) { seen.add(k); edges.push({ s: a.entity_id, t: b.entity_id, kind: "inferred" }); }
  }
  return { nodes: [...nodes.values()], edges };
}
