"use client";
import Link from "next/link";
import dynamic from "next/dynamic";
import { useMemo, useState } from "react";
import { useEffect } from "react";
import { Nazar } from "@/components/Doodles";
import type { Scored } from "@/lib/correlate";
const Chart = dynamic(() => import("echarts-for-react"), { ssr: false });
const col: Record<string, string> = { AFTERIMAGE: "#6FD43A", TRUSTLESS: "#8B5CF6", PHANTOM_DATA: "#3A86FF", DECEPTION_LAB: "#FFB703" };
const nm = (m: string) => m.replace("_", " ").toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
function Stat({ label, value, sub, c }: { label: string; value: string | number; sub: string; c: string }) {
  return <div className="sticker p-4" style={{ ["--c" as string]: c }}><p className="text-sm text-dhuan">{label}</p><p className="font-head text-4xl font-bold" style={{ color: c }}>{value}</p><p className="font-mono text-[11px] text-dhuan">{sub}</p></div>;
}
export default function Command() {
  const [scored, setScored] = useState<Scored[]>([]); const [mode, setMode] = useState(""); const [loaded, setLoaded] = useState(false);
  const act = async (action?: string) => { const j = await (await fetch("/api/events", action ? { method: "POST", body: JSON.stringify({ action }) } : { cache: "no-store" })).json(); setScored(j.events); setMode(j.mode); setLoaded(true); };
  useEffect(() => { act(); }, []);
  const [st, setSt] = useState<Record<string, boolean> | null>(null);
  useEffect(() => { fetch("/api/status").then((r) => r.json()).then(setSt).catch(() => {}); }, []);
  const [q, setQ] = useState(""); const [brief, setBrief] = useState(""); const [bb, setBb] = useState(false);
  async function summarise() { setBb(true); const j = await (await fetch("/api/grok", { method: "POST", body: JSON.stringify({ mode: "case" }) })).json(); setBrief(j.text ?? j.error); setBb(false); } const [out, setOut] = useState<Record<string, string>>({}); const [busy, setBusy] = useState("");
  const high = scored.filter((e) => e.risk.total >= 70).length;
  // Posture = 100 minus the mean risk score of open findings. Every finding is treated as open in this demo.
  const posture = scored.length ? Math.max(0, 100 - Math.round(scored.reduce((a, e) => a + e.risk.total, 0) / scored.length)) : 100;
  const mods = useMemo(() => Object.keys(col).map((m) => ({ name: nm(m), value: scored.filter((e) => e.module === m).length, itemStyle: { color: col[m] } })), [scored]);
  const latest = [...scored].sort((a, b) => b.timestamp.localeCompare(a.timestamp));
  const list = [...scored].sort((a, b) => b.risk.total - a.risk.total).filter((e) => (e.description + e.module + e.event_type + e.entity_id).toLowerCase().includes(q.toLowerCase()));
  async function explain(e: (typeof scored)[number]) {
    setBusy(e.event_id); const { risk, ...ev } = e;
    const j = await (await fetch("/api/grok", { method: "POST", body: JSON.stringify(ev) })).json();
    setOut((o) => ({ ...o, [e.event_id]: j.text ?? j.error })); setBusy("");
  }
  return (
    <main className="px-5 py-8">
      <div className="relative overflow-hidden rounded-2xl border border-white/10 p-6 pr-4 md:pr-72">
        <img src="/banner.jpg" alt="" className="absolute inset-0 -z-10 h-full w-full object-cover object-right opacity-70 [mask-image:linear-gradient(to_right,transparent,black_45%)]" />
        <h1 className="title !text-4xl md:!text-5xl">Welcome back,<br />Researcher.</h1>
        <p className="mt-2">Here&apos;s your <span className="text-nimbu">security</span> snapshot. All people and systems are synthetic.</p>
        <div className="sticker mt-4 p-4 md:absolute md:right-5 md:top-5 md:mt-0 md:w-60" style={{ ["--c" as string]: "#6FD43A" }}>
          <p className="text-sm">Security posture</p><p className="font-head text-4xl font-bold">{posture}<span className="text-lg text-dhuan">/100</span></p>
          <p className="text-[11px] text-dhuan">100 minus the mean risk of open findings</p></div>
      </div>
      <div className="mt-5 flex flex-wrap items-center gap-3"><button className="btn" onClick={() => act("seed")}>Load NEXUS demo case</button><button className="btn !bg-transparent !text-safed border border-white/20" onClick={() => act("reset")}>Reset workspace</button><button className="btn !bg-[#8B5CF6] !text-white" onClick={summarise} disabled={bb}>{bb ? "Writing…" : "Case summary (Grok)"}</button><span className="font-mono text-xs text-dhuan">storage: {mode || "…"}{mode === "memory" ? " (temporary, add DATABASE_URL to keep data)" : ""}</span></div>
      {brief && <p className="mt-3 max-w-3xl whitespace-pre-line rounded-lg border border-jamun/60 p-3 text-sm">{brief}</p>}
      <input aria-label="Search findings" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search findings, modules or entities…" className="mt-5 w-full max-w-xl rounded-xl border border-jamun/60 bg-black/40 px-4 py-2.5 text-sm" />
      <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Total findings" value={scored.length} sub="stored in the workspace" c="#6FD43A" /><Stat label="High risk (70+)" value={high} sub="score ≥ 70" c="#FF5D5D" />
        <Stat label="Investigations" value={scored.length ? 1 : 0} sub="demo workspace" c="#8B5CF6" /><Stat label="Latest event" value={latest[0]?.timestamp.slice(11, 16) ?? "–"} sub="UTC · simulated clock" c="#3A86FF" />
      </div>
      <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_300px_340px]">
        <section aria-label="Priority findings" className="space-y-4">
          <h2 className="font-head text-lg font-bold">Priority findings</h2>
          {loaded && scored.length === 0 && <div className="flex items-center gap-4 text-dhuan"><Nazar className="h-14 w-14 shrink-0 text-haldi" /><p>The workspace is empty. Load the demo case, or run a module and its findings will appear here.</p></div>}
          {scored.length > 0 && list.length === 0 && <p className="text-dhuan">No finding matches &ldquo;{q}&rdquo;. Clear the search to see all {scored.length}.</p>}
          {list.map((e) => (
            <article key={e.event_id} className="sticker p-4" style={{ ["--c" as string]: col[e.module] }}>
              <div className="flex justify-between"><span className="font-mono text-xs">{e.event_id} · {nm(e.module)}</span><span className="font-head text-3xl font-bold" style={{ color: col[e.module] }}>{e.risk.total}</span></div>
              <p className="mt-1 text-sm">{e.description}</p><p className="mt-1 text-sm"><b>Fix:</b> {e.recommended_action}</p>
              <details className="mt-2 text-sm"><summary className="cursor-pointer text-haldi">Why this score?</summary>{e.risk.factors.map((f) => <p key={f.name} className="font-mono text-xs">{f.name} {f.value} × {f.weight} = {f.points}</p>)}</details>
              <button className="btn mt-3" onClick={() => explain(e)} disabled={busy === e.event_id}>{busy === e.event_id ? "Asking Grok…" : "Explain with Grok"}</button>
              {out[e.event_id] && <p className="mt-3 rounded-lg border border-jamun/60 p-3 text-sm">{out[e.event_id]}</p>}
            </article>))}
        </section>
        <section className="sticker h-fit p-4" style={{ ["--c" as string]: "#3A86FF" }}>
          <h2 className="font-head font-bold">Findings by module</h2>
          <div className="relative"><Chart style={{ height: 210 }} option={{ backgroundColor: "transparent", tooltip: { trigger: "item" }, series: [{ type: "pie", radius: ["58%", "80%"], label: { show: false }, itemStyle: { borderColor: "#0C0A12", borderWidth: 3 }, data: mods }] }} />
            <p className="pointer-events-none absolute inset-0 grid place-items-center text-center font-head text-3xl font-bold">{scored.length}<span className="-mt-8 block text-xs font-normal text-dhuan">Total</span></p></div>
          {mods.map((m) => <p key={m.name} className="flex items-center gap-2 text-xs"><span className="h-2.5 w-2.5 rounded-sm" style={{ background: m.itemStyle.color }} />{m.name}<span className="ml-auto font-mono">{m.value}</span></p>)}
        </section>
        <aside className="space-y-5">
          <section className="sticker p-4" style={{ ["--c" as string]: "#8B5CF6" }}>
            <h2 className="font-head font-bold">Activity feed</h2>
            {latest.map((e) => <div key={e.event_id} className="mt-3 border-l-2 pl-3" style={{ borderColor: col[e.module] }}><p className="text-sm font-bold" style={{ color: col[e.module] }}>{nm(e.module)} <span className="font-mono text-[11px] font-normal text-dhuan">{e.timestamp.slice(11, 16)}</span></p><p className="text-xs text-safed/80">{e.event_type.replaceAll("_", " ").toLowerCase()}</p></div>)}
          </section>
          <section className="sticker p-4" style={{ ["--c" as string]: "#6FD43A" }}>
            <h2 className="font-head font-bold">Recent investigations</h2>
            <p className="mt-2 text-sm"><b>NEXUS Research</b> <span className="rounded bg-rani/20 px-1.5 text-xs text-rani">{high ? "High risk" : "Medium"}</span></p><p className="font-mono text-[11px] text-dhuan">{scored.length} findings · simulated</p>
            <Link href="/reports" className="btn mt-3">Open report</Link>
          </section>
          <section className="sticker p-4" style={{ ["--c" as string]: "#FFB703" }}><h2 className="font-head font-bold">Integrations</h2>{st && [["database", "Postgres (Neon)"], ["login", "Login and roles"], ["ai", "Grok / AI key"], ["neo4j", "Neo4j graph"]].map(([k, l]) => <p key={k} className="mt-1 text-sm"><span className={st[k] ? "text-nimbu" : "text-dhuan"}>{st[k] ? "✔" : "○"}</span> {l}{st[k] ? "" : <span className="text-dhuan"> · not set</span>}</p>)}</section>
          <section className="sticker p-4" style={{ ["--c" as string]: "#6FD43A" }}><h2 className="font-head text-xl font-bold">Stay Ahead.<br />Stay Secure.</h2><Link href="/afterimage" className="btn mt-3">Launch Investigation</Link></section>
        </aside>
      </div>
      {scored.length > 0 && <section className="sticker mt-5 p-4" style={{ ["--c" as string]: "#3A86FF" }}><h2 className="font-head font-bold">Activity timeline</h2><Chart style={{ height: 220 }} option={{ backgroundColor: "transparent", tooltip: { formatter: (p: any) => p.value[2] }, grid: { left: 40, right: 20, top: 20, bottom: 30 }, xAxis: { type: "time" }, yAxis: { type: "value", name: "risk", min: 0, max: 100 }, series: [{ type: "scatter", symbolSize: 14, data: scored.map((e) => ({ value: [e.timestamp, e.risk.total, `${e.event_id} ${e.event_type}`], itemStyle: { color: col[e.module] } })) }] }} /></section>}
    </main>
  );
}
