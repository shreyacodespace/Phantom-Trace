import { list, withRisk, auditList } from "@/lib/db";
import { buildGraph } from "@/lib/correlate";
import type { PEvent } from "@/lib/seed";
export const dynamic = "force-dynamic";
const TC: Record<string, string> = { document: "#6FD43A", credential: "#8B5CF6", application: "#3A86FF", decoy: "#FFB703" };
function Snap({ evs }: { evs: PEvent[] }) {
  const g = buildGraph(evs), ents = g.nodes.filter((n) => n.type !== "event"), P: Record<string, [number, number]> = {};
  ents.forEach((n, i) => { const a = (i / ents.length) * 6.283 - 1.57; P[n.id] = [300 + Math.cos(a) * (ents.length > 1 ? 110 : 0), 160 + Math.sin(a) * (ents.length > 1 ? 110 : 0)]; });
  if (!ents.length) return <p className="text-sm text-dhuan">No graph yet.</p>;
  return <svg viewBox="0 0 600 320" className="mt-2 w-full max-w-2xl" role="img" aria-label="Graph snapshot">
    {g.edges.filter((e) => e.kind === "inferred").map((e, i) => <line key={i} x1={P[e.s][0]} y1={P[e.s][1]} x2={P[e.t][0]} y2={P[e.t][1]} stroke="#858A96" strokeWidth="2" strokeDasharray="6 5" />)}
    {evs.map((e) => { const [x, y] = P[e.entity_id]; return <g key={e.event_id}><line x1={x} y1={y} x2={x + (x - 300) * 0.3 + 14} y2={y + (y - 160) * 0.3 - 14} stroke="#858A96" strokeWidth="2" /><circle cx={x + (x - 300) * 0.3 + 14} cy={y + (y - 160) * 0.3 - 14} r="6" fill="#FF5D5D" /></g>; })}
    {ents.map((n) => <g key={n.id}><circle cx={P[n.id][0]} cy={P[n.id][1]} r="15" fill={TC[n.type]} /><text x={P[n.id][0]} y={P[n.id][1] + 30} textAnchor="middle" fontSize="11" fill="currentColor">{n.id}</text></g>)}
  </svg>;
}
import { W } from "@/lib/risk";
export default async function Reports() {
  const evs = await list(); const f = withRisk(evs).sort((a, b) => b.risk.total - a.risk.total); const { edges } = buildGraph(evs); const logs = await auditList();
  return (
    <main className="px-5 py-8">
      <h1 className="title">Investigation report</h1>
      <p className="mt-1 font-mono text-xs text-dhuan">Demo workspace · NEXUS Research Labs is fictional · synthetic data</p>
      <p className="noprint mt-4 text-sm text-dhuan">Use your browser&apos;s Print dialog and choose Save as PDF. Print layout is white for paper.</p>
      <h2 className="mt-8 font-head text-xl font-bold">Findings</h2>
      {f.length === 0 && <p className="mt-4 text-dhuan">No findings stored yet. Run a module, or load the demo case from the dashboard.</p>}
      {f.map((e) => (
        <article key={e.event_id} className="sticker mt-4 p-4" style={{ ["--c" as string]: "#8B5CF6" }}>
          <div className="flex justify-between"><b>{e.event_id} · {e.event_type}</b><b>{e.risk.total}/100</b></div>
          <p className="mt-1 text-sm">{e.description}</p>
          <p className="mt-1 font-mono text-xs">entity {e.entity_id} · evidence {e.evidence_refs.join(", ")} · {e.timestamp}</p>
          <p className="mt-1 font-mono text-xs">{e.risk.factors.map((x) => `${x.name} ${x.value}×${x.weight}=${x.points}`).join(" + ")}</p>
          <p className="mt-1 text-sm"><b>Recommendation:</b> {e.recommended_action}</p>
        </article>))}
      <h2 className="mt-8 font-head text-xl font-bold">Graph snapshot</h2>
      <Snap evs={evs} />
      <p className="text-xs text-dhuan">Solid = recorded by a module. Dashed = events from different modules within an hour. Not evidence of a shared cause.</p>
      <h2 className="mt-8 font-head text-xl font-bold">Relationships</h2>
      <p className="text-sm text-dhuan">Observed means a module recorded it. Inferred means a rule linked it. Hypothesis needs human review and is not a conclusion.</p>
      {["observed", "inferred", "hypothesis"].map((k) => <p key={k} className="mt-2 text-sm"><b>{k}:</b> {edges.filter((x) => x.kind === k).map((x) => `${x.s}–${x.t}`).join(", ") || "none"}</p>)}
      <h2 className="mt-8 font-head text-xl font-bold">Scoring model</h2>
      <p className="text-sm">Risk = 100 × ({W.severity} × severity + {W.confidence} × confidence + {W.impact} × impact). Severity maps LOW .25, MEDIUM .5, HIGH .75, CRITICAL 1.</p>
      <h2 className="mt-8 font-head text-xl font-bold">Audit log</h2>
      {logs.length === 0 ? <p className="text-sm text-dhuan">No actions recorded yet.</p> : logs.map((l, i) => <p key={i} className="font-mono text-xs">{l.ts.slice(0, 19)} {l.actor} {l.action}</p>)}
      <button className="btn noprint mt-6" id="print">Print / Save as PDF</button>
      <script dangerouslySetInnerHTML={{ __html: "document.getElementById('print').onclick=function(){window.print()}" }} />
    </main>
  );
}
