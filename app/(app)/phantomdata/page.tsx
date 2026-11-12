"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import cytoscape from "cytoscape";
const C = "#FF3D8B", CATS = ["email", "phone", "name"];
const IDS = ["FORM", "API", "DB", "MAIL", "ANALYTICS", "CRM"];
const DEFAULT: Record<string, string[]> = { FORM: CATS, API: CATS, DB: CATS, MAIL: ["email", "name"], ANALYTICS: [], CRM: CATS };
const tc: Record<string, string> = { client: "#6FD43A", service: "#8B5CF6", database: "#FFB703", third_party: "#FF3D8B" };
export default function PhantomData() {
  const [allow, setAllow] = useState(DEFAULT); const [mask, setMask] = useState(false);
  const [res, setRes] = useState<any>(null); const [busy, setBusy] = useState(false); const [err, setErr] = useState(""); const [lin, setLin] = useState("phone");
  const g = useRef<HTMLDivElement>(null);
  async function run() {
    setBusy(true); setErr("");
    const r = await fetch("/api/phantomdata", { method: "POST", body: JSON.stringify({ allow, maskLinks: mask ? ["API>ANALYTICS"] : [] }) });
    const j = await r.json(); setBusy(false); r.ok ? setRes(j) : setErr(j.error);
  }
  useEffect(() => {
    if (!res || !g.current) return;
    const cy = cytoscape({ container: g.current, layout: { name: "breadthfirst", directed: true, roots: "#FORM" as any, padding: 20 } as any,
      elements: [...res.graph.nodes.map((n: any) => ({ data: { id: n.id, label: n.label, type: n.type } })), ...res.graph.edges.map((e: any, i: number) => ({ data: { id: "e" + i, source: e.s, target: e.t, bad: e.bad ? 1 : 0 } }))],
      style: [{ selector: "node", style: { label: "data(label)", color: "#F0F0EC", "font-size": 10, "text-valign": "bottom", "text-margin-y": 4, "background-color": (n: any) => tc[n.data("type")] } },
        { selector: "edge", style: { width: 3, "curve-style": "bezier", "target-arrow-shape": "triangle", "line-color": (e: any) => (e.data("bad") ? "#FF3D8B" : "#858A96"), "target-arrow-color": (e: any) => (e.data("bad") ? "#FF3D8B" : "#858A96"), "line-style": (e: any) => (e.data("bad") ? "dashed" : "solid") } }] as any });
    return () => cy.destroy();
  }, [res]);
  const L = res?.lineage.find((x: any) => x.field === lin);
  return (
    <main className="mx-auto max-w-6xl px-5 py-8">
      <h1 className="title mt-2 text-5xl md:text-7xl" style={{ color: C }}>PHANTOM DATA</h1>
      <p className="mt-2 max-w-2xl text-dhuan">A test sign-up app sends three synthetic users through six components. Set the policy, run it, and see where sensitive fields end up. Only this built-in app is simulated. Nothing external is scanned.</p>
      <div className="mt-8 grid gap-6 md:grid-cols-[360px_1fr]">
        <section className="sticker p-4" style={{ ["--c" as string]: "#FFB703" }}>
          <h2 className="font-head font-bold">Policy: who may receive what</h2>
          <table className="mt-2 w-full text-xs"><thead><tr><th className="text-left">Component</th>{CATS.map((c) => <th key={c}>{c}</th>)}</tr></thead><tbody>
            {IDS.map((id) => <tr key={id}><td className="py-1 font-mono">{id}</td>{CATS.map((c) => <td key={c} className="text-center"><input type="checkbox" aria-label={`${id} may receive ${c}`} checked={allow[id].includes(c)}
              onChange={(e) => setAllow((a) => ({ ...a, [id]: e.target.checked ? [...a[id], c] : a[id].filter((x) => x !== c) }))} /></td>)}</tr>)}</tbody></table>
          <label className="mt-3 flex items-center gap-2 text-sm"><input type="checkbox" checked={mask} onChange={(e) => setMask(e.target.checked)} />Mask sensitive fields on API → ANALYTICS</label>
          <button className="btn mt-4 !py-1.5 text-sm" onClick={run} disabled={busy}>{busy ? "Running…" : "Run simulation"}</button>
          {err && <p role="alert" className="mt-2 text-rani">{err}</p>}
        </section>
        <section aria-live="polite">
          {!res ? <p className="text-dhuan">Nothing has run yet. Press Run simulation to push the synthetic records through the app.</p> : <>
            <div ref={g} className="sticker h-72" style={{ ["--c" as string]: "#8B5CF6" }} />
            <p className="mt-2 font-mono text-xs text-dhuan">{res.flowCount} field transfers recorded · pink dashed arrows carry a policy violation</p>
            {res.violations.length === 0 && <p className="sticker mt-4 p-4" style={{ ["--c" as string]: "#6FD43A" }}>No policy violations. Every sensitive field stayed inside the policy.</p>}
            {res.violations.map((v: any) => <article key={v.event_id} className="sticker mt-4 p-4" style={{ ["--c" as string]: C }}>
              <div className="flex justify-between"><b>{v.category} → {v.entity_id}</b><span className="font-glitch text-2xl">{v.risk.total}</span></div>
              <p className="mt-1 text-sm">{v.description}</p><p className="mt-1 text-sm"><b>Fix:</b> {v.recommended_action}</p>
              <details className="mt-2 text-sm"><summary className="cursor-pointer text-haldi">Why this score?</summary>{v.risk.factors.map((x: any) => <p key={x.name} className="font-mono text-xs">{x.name} {x.value} × {x.weight} = {x.points}</p>)}<p className="font-mono text-xs">{v.event_id} · evidence {v.evidence_refs.join(", ")}</p></details></article>)}
            <h2 className="mt-8 font-head text-xl font-bold">Data lineage</h2>
            <div className="mt-2 flex gap-2">{CATS.map((c) => <button key={c} onClick={() => setLin(c)} className={`rounded-full border-2 px-3 py-1 text-sm ${lin === c ? "border-nimbu text-nimbu" : "border-dhuan"}`}>{c}</button>)}</div>
            {L && <p className="mt-3 font-mono text-xs leading-7">origin {L.origin}{L.hops.map((h: any) => <span key={h.link}> → <span className={h.allowed ? "" : "text-rani"}>{h.link.split(">")[1]}{h.masked ? " (masked)" : ""}{h.allowed ? "" : " ✘"}</span></span>)}<br />ends at: {L.destinations.join(", ")}</p>}
          </>}
        </section>
      </div>
    </main>
  );
}
