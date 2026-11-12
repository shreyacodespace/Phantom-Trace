"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import cytoscape from "cytoscape";
import { buildGraph, type Scored } from "@/lib/correlate";
const tc: Record<string, string> = { document: "#6FD43A", credential: "#8B5CF6", application: "#3A86FF", decoy: "#FFB703", event: "#FF5D5D" };
export default function Graph() {
  const el = useRef<HTMLDivElement>(null); const [evs, setEvs] = useState<Scored[] | null>(null); const [sel, setSel] = useState(""); const [info, setInfo] = useState<any>(null);
  useEffect(() => { fetch("/api/events", { cache: "no-store" }).then((r) => r.json()).then((j) => setEvs(j.events)); }, []);
  useEffect(() => { if (evs?.length) fetch("/api/graph", { method: "POST" }).then((r) => r.json()).then(setInfo).catch(() => {}); }, [evs]);
  useEffect(() => {
    if (!evs?.length || !el.current) return;
    const g = buildGraph(evs);
    const cy = cytoscape({ container: el.current, layout: { name: "cose", animate: false } as any,
      elements: [...g.nodes.map((n) => ({ data: { id: n.id, type: n.type } })), ...g.edges.map((e, i) => ({ data: { id: "e" + i, source: e.s, target: e.t, kind: e.kind } }))],
      style: [{ selector: "node", style: { label: "data(id)", color: "#F0F0EC", "font-size": 9, "background-color": (n: any) => tc[n.data("type")] } },
        { selector: "edge", style: { width: 2, "line-color": "#858A96", "line-style": (e: any) => (e.data("kind") === "observed" ? "solid" : "dashed") } }] as any });
    cy.on("tap", "node", (ev) => setSel(ev.target.id()));
    return () => cy.destroy();
  }, [evs]);
  const hit = evs?.filter((e) => e.event_id === sel || e.entity_id === sel) ?? [];
  return (
    <main className="px-5 py-8">
      <h1 className="title">Investigation graph</h1>
      <p className="mt-2 max-w-2xl text-sm text-dhuan">Solid lines: a module recorded the event on that entity. Dashed lines: events from different modules within an hour of each other. Being close in time does not show a shared cause.</p>
      {evs && evs.length === 0 && <p className="mt-6">No findings yet. <Link href="/command" className="text-nimbu underline">Load the demo case</Link> or run a module.</p>}
      {!evs && <p className="mt-6 text-dhuan">Loading…</p>}
      {!!evs?.length && <div className="mt-6 grid gap-5 md:grid-cols-[1fr_300px]">
        <div ref={el} className="sticker h-[540px]" style={{ ["--c" as string]: "#8B5CF6" }} />
        <aside className="sticker p-4 text-sm" style={{ ["--c" as string]: "#FFB703" }}><p className="font-mono text-xs">{sel || "Tap a node"}</p>
          {info && <div className="mt-4 border-t border-white/10 pt-3"><p className="font-mono text-[11px] text-dhuan">graph engine: {info.source}</p><p className="mt-1 text-xs">Most connected entities</p>{info.ranking.map((x: any) => <p key={x.id} className="font-mono text-xs">{x.id} · {x.degree} links</p>)}</div>}
          {hit.map((e) => <div key={e.event_id} className="mt-3"><p className="font-bold">{e.event_type}</p><p>{e.description}</p><p className="font-mono text-xs">risk {e.risk.total} · evidence {e.evidence_refs.join(", ")}</p></div>)}</aside>
      </div>}
    </main>
  );
}
