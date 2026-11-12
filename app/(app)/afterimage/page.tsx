"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import cytoscape from "cytoscape";
const C = "#6FD43A";
const tc: Record<string, string> = { document: "#6FD43A", event: "#FF3D8B", hypothesis: "#FFB703" };
const SAMPLE = "NEXUS Research Labs - internal brief (SIMULATED)\nContact: priya.n@nexus-labs.example, +91 98765 43210\nPAN: ABCDE1234F\nBuild server: build01.research.internal\nSaved from C:\\Users\\priya.n\\Documents\\brief.docx\n";
export default function Afterimage() {
  const [res, setRes] = useState<any>(null); const [err, setErr] = useState(""); const [busy, setBusy] = useState(false); const [sel, setSel] = useState<any>(null); const [drag, setDrag] = useState(false);
  const gref = useRef<HTMLDivElement>(null);
  async function run(file: File) {
    setBusy(true); setErr(""); setRes(null); setSel(null);
    const fd = new FormData(); fd.append("file", file);
    const r = await fetch("/api/afterimage", { method: "POST", body: fd }); const j = await r.json();
    setBusy(false); r.ok ? setRes(j) : setErr(j.error ?? "Analysis failed.");
  }
  useEffect(() => {
    if (!res || !gref.current) return;
    const cy = cytoscape({ container: gref.current, layout: { name: "cose", animate: false },
      elements: [...res.graph.nodes.map((n: any) => ({ data: { id: n.id, type: n.type } })), ...res.graph.edges.map((e: any, i: number) => ({ data: { id: "e" + i, source: e.s, target: e.t, kind: e.kind } }))],
      style: [{ selector: "node", style: { label: (n: any) => (n.data("type") === "event" ? "" : n.id()), color: "#F0F0EC", "font-size": 10, "background-color": (n: any) => tc[n.data("type")] } },
        { selector: "edge", style: { width: 2, "line-color": "#858A96", "line-style": (e: any) => (e.data("kind") === "observed" ? "solid" : "dashed") } }] as any });
    cy.on("tap", "node", (ev) => setSel(res.findings.find((f: any) => f.event_id === ev.target.id()) ?? null));
    return () => cy.destroy();
  }, [res]);
  return (
    <main className="mx-auto max-w-6xl px-5 py-8">
      <h1 className="title mt-2 text-5xl text-nimbu md:text-7xl">AFTERIMAGE</h1>
      <p className="mt-2 max-w-2xl text-dhuan">Drop a PDF, photo or text file you are allowed to inspect. It is analysed in memory and never stored. Findings show a masked value, the reason, and a fix.</p>
      <label onDragOver={(e) => { e.preventDefault(); setDrag(true); }} onDragLeave={() => setDrag(false)} onDrop={(e) => { e.preventDefault(); setDrag(false); e.dataTransfer.files[0] && run(e.dataTransfer.files[0]); }}
        className="sticker mt-8 block cursor-pointer p-10 text-center" style={{ ["--c" as string]: drag ? "#FF3D8B" : C }}>
        <input type="file" className="sr-only" accept=".pdf,.jpg,.jpeg,.png,.txt,.md,.csv" onChange={(e) => e.target.files?.[0] && run(e.target.files[0])} />
        <span className="font-head text-xl font-bold">{busy ? "Reading the traces…" : "Drop a file here or click to choose"}</span>
        <span className="mt-1 block text-sm text-dhuan">PDF, JPEG, PNG, TXT · up to 5 MB</span>
      </label>
      <button className="btn mt-4 !py-1.5 text-sm" onClick={() => run(new File([SAMPLE], "nexus_brief.txt", { type: "text/plain" }))}>Try the synthetic NEXUS sample</button>
      {err && <p role="alert" className="mt-4 text-rani">{err}</p>}
      {res && <div className="mt-8 grid gap-6 md:grid-cols-[1fr_340px]" aria-live="polite">
        <div>
          <p className="font-mono text-xs text-dhuan">{res.doc} · {res.kind} · {res.findings.length} findings</p>
          {res.findings.length === 0 && <p className="mt-3">No sensitive details found in what could be read.</p>}
          {[...res.findings].sort((a: any, b: any) => b.risk.total - a.risk.total).map((f: any) => (
            <article key={f.event_id} className="sticker mt-4 p-4" style={{ ["--c" as string]: f.risk.total >= 70 ? "#FF3D8B" : f.risk.total >= 45 ? "#FFB703" : C }}>
              <div className="flex justify-between"><b>{f.description}</b><span className="font-glitch text-2xl">{f.risk.total}</span></div>
              <p className="mt-1 text-sm">{f.reason}</p><p className="mt-1 text-sm"><b>Fix:</b> {f.recommended_action}</p>
              <details className="mt-2 text-sm"><summary className="cursor-pointer text-haldi">Why this score?</summary>{f.risk.factors.map((x: any) => <p key={x.name} className="font-mono text-xs">{x.name} {x.value} × {x.weight} = {x.points}</p>)}<p className="font-mono text-xs">{f.event_id} · {f.evidence_refs[0]}</p></details>
            </article>))}
          {res.notes.map((n: string) => <p key={n} className="mt-3 text-sm text-haldi">{n}</p>)}
        </div>
        <aside><div ref={gref} className="sticker h-72" style={{ ["--c" as string]: "#8B5CF6" }} />
          <p className="mt-2 text-xs text-dhuan">Solid lines are observed. Dashed lines are inferred. Tap a pink node to inspect it.</p>
          {sel && <p className="mt-2 text-sm">{sel.description}</p>}</aside>
      </div>}
    </main>
  );
}
