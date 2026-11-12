"use client";
import { useEffect, useState } from "react";
const C = "#FFB703";
const post = (b: object) => fetch("/api/deception", { method: "POST", body: JSON.stringify(b) }).then((r) => r.json());
export default function Deception() {
  const [log, setLog] = useState<any[]>([]); const [fs, setFs] = useState<any[]>([]); const [sc, setSc] = useState<any[]>([]); const [user, setUser] = useState(""); const [n, setN] = useState(0);
  useEffect(() => { post({ action: "analyse", interactions: log }).then((j) => { setFs(j.findings ?? []); setSc(j.scores ?? []); }); }, [log]);
  const add = (type: string, resource: string, status: string) => { setN((x) => x + 1); setLog((l) => [...l, { id: `IX-U${n + 1}`, ts: new Date().toISOString(), source: "SRC-YOU", type, resource, status }]); };
  const sim = async (s: string) => { const j = await post({ action: "generate", scenario: s }); setLog((l) => [...l, ...j.interactions]); };
  return (
    <main className="px-5 py-8">
      <h1 className="title" style={{ color: C }}>Deception Lab</h1>
      <p className="mt-2 max-w-2xl text-dhuan">An isolated decoy admin portal with dummy records. Everything that touches it is recorded and checked against three fixed rules. Passwords typed here are never read or stored.</p>
      <div className="mt-6 grid gap-5 lg:grid-cols-[320px_1fr]">
        <div className="space-y-5">
          <section className="sticker p-4" style={{ ["--c" as string]: C }}>
            <h2 className="font-head font-bold">Decoy admin portal <span className="font-mono text-[10px] text-haldi">(fake)</span></h2>
            <input aria-label="Username" value={user} onChange={(e) => setUser(e.target.value)} placeholder="admin" className="mt-3 w-full rounded-lg bg-black/40 p-2 text-sm" />
            <input aria-label="Password" type="password" placeholder="••••••••" className="mt-2 w-full rounded-lg bg-black/40 p-2 text-sm" />
            <button className="btn mt-3" onClick={() => add("login_attempt", "/admin-portal", "401")}>Sign in (always fails)</button>
            <div className="mt-3 flex flex-wrap gap-2 text-xs"><button className="rounded border border-white/20 px-2 py-1" onClick={() => add("file_access", "/backup/db_dump.sql", "200")}>Open /backup/db_dump.sql</button><button className="rounded border border-white/20 px-2 py-1" onClick={() => add("path_probe", "/.env", "404")}>Request /.env</button></div>
          </section>
          <section className="sticker p-4" style={{ ["--c" as string]: "#8B5CF6" }}>
            <h2 className="font-head font-bold">Simulate a visitor</h2>
            <div className="mt-3 flex flex-wrap gap-2">{[["normal", "Normal user"], ["burst", "Login burst"], ["probe", "Path probing"], ["honey", "Honeyfile access"]].map(([k, l]) => <button key={k} className="btn" onClick={() => sim(k)}>{l}</button>)}</div>
            <button className="mt-3 text-xs text-dhuan underline" onClick={() => setLog([])}>Clear log</button>
          </section>
        </div>
        <div className="space-y-5" aria-live="polite">
          <section className="sticker p-4" style={{ ["--c" as string]: "#FF5D5D" }}>
            <h2 className="font-head font-bold">Behavioural findings</h2>
            {log.length === 0 && <p className="mt-2 text-dhuan">No interactions yet. Use the decoy or simulate a visitor.</p>}
            {log.length > 0 && fs.length === 0 && <p className="mt-2 text-nimbu">Behaviour so far is within the rules. Nothing flagged.</p>}
            {fs.map((f) => <article key={f.event_id} className="mt-3 border-t border-white/10 pt-3"><div className="flex justify-between"><b className="font-mono text-sm">{f.event_type} · {f.entity_id}</b><span className="font-head text-2xl font-bold">{f.risk.total}</span></div>
              <p className="text-sm">{f.description}</p><p className="text-sm"><b>Next step:</b> {f.recommended_action}</p>
              <details className="text-sm"><summary className="cursor-pointer text-haldi">Why this score?</summary>{f.risk.factors.map((x: any) => <p key={x.name} className="font-mono text-xs">{x.name} {x.value} × {x.weight} = {x.points}</p>)}<p className="font-mono text-xs">evidence {f.evidence_refs.join(", ")}</p></details></article>)}
          </section>
          {sc.length > 0 && <section className="sticker p-4" style={{ ["--c" as string]: "#8B5CF6" }}>
            <h2 className="font-head font-bold">ML anomaly scores</h2>
            <p className="text-xs text-dhuan">Isolation Forest trained on a synthetic baseline of ordinary sessions. Scores of 0.60 or more count as unusual. It supports the rules and does not replace them.</p>
            {sc.map((x) => <p key={x.source} className="mt-2 font-mono text-xs">{x.source} · {x.score} · <span className={x.score >= 0.6 ? "text-rani" : "text-nimbu"}>{x.score >= 0.6 ? "unusual" : "typical"}</span> · biggest deviation: {x.top} ({x.value})</p>)}
          </section>}
          <section className="sticker p-4" style={{ ["--c" as string]: "#3A86FF" }}>
            <h2 className="font-head font-bold">Interaction timeline <span className="font-mono text-xs font-normal text-dhuan">{log.length} recorded</span></h2>
            <div className="mt-2 max-h-64 overflow-auto font-mono text-[11px] leading-6">{[...log].sort((a, b) => b.ts.localeCompare(a.ts)).map((x) => <p key={x.id}>{x.ts.slice(11, 19)} {x.source} {x.type} {x.resource} → {x.status}</p>)}</div>
          </section>
        </div>
      </div>
    </main>
  );
}
