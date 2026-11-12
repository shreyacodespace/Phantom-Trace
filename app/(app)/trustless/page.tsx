"use client";
import Link from "next/link";
import { useState } from "react";
const C = "#8B5CF6";
async function api(body: object) { const r = await fetch("/api/trust", { method: "POST", body: JSON.stringify(body) }); return r.json(); }
export default function Trustless() {
  const [cred, setCred] = useState<any>(null);
  const [reveal, setReveal] = useState<string[]>([]);
  const [res, setRes] = useState<any>(null);
  const [hist, setHist] = useState<any[]>([]);
  const [fa, setFa] = useState("Offer letter v1"); const [fb, setFb] = useState("Offer letter v1 ");
  const [fp, setFp] = useState<any>(null);
  const [err, setErr] = useState("");
  const issue = async (issuer: string, days = 90) => {
    const j = await api({ action: "issue", issuer, subject: "Priya N. (synthetic)", days, claims: { name: "Priya N.", dob: "2005-03-14", degree: "B.Tech ECE-AI", employee_id: "NX-4471" } });
    if (j.error) return setErr(j.error); setErr(""); setCred(j); setReveal([]); setRes(null);
  };
  const tamper = () => setCred((c: any) => ({ ...c, payload: { ...c.payload, sub: "Someone Else (tampered)" } }));
  const verify = async () => {
    const disclosed = Object.fromEntries(reveal.map((k) => [k, cred.disclosures[k]]));
    const j = await api({ action: "verify", payload: cred.payload, sig: cred.sig, disclosed });
    setRes(j); setHist((h) => [{ id: cred.payload.id, iss: cred.payload.iss, valid: j.valid, at: new Date().toISOString() }, ...h]);
  };
  return (
    <main className="mx-auto max-w-6xl px-5 py-8">
      <h1 className="title mt-2 text-5xl md:text-7xl" style={{ color: C }}>TRUSTLESS</h1>
      <p className="mt-2 max-w-2xl text-dhuan">Credentials are signed with Ed25519 and checked against the issuer's public key and a trust registry. A hash alone never decides authenticity. All people and issuers here are synthetic.</p>
      <div className="mt-8 grid gap-6 md:grid-cols-2">
        <section className="sticker p-5" style={{ ["--c" as string]: C }}>
          <h2 className="font-head text-xl font-bold">1. Issue a test credential</h2>
          <div className="mt-3 flex flex-wrap gap-3">
            <button className="btn !py-1.5 text-sm" onClick={() => issue("NEXUS-CA")}>Issue (NEXUS-CA)</button>
            <button className="btn !py-1.5 text-sm" onClick={() => issue("ROGUE-CA")}>Issue (ROGUE-CA, untrusted)</button>
            <button className="btn !py-1.5 text-sm" onClick={() => issue("NEXUS-CA", -1)}>Issue (already expired)</button>
          </div>
          {err && <p role="alert" className="mt-3 text-rani">{err}</p>}
          {!cred ? <p className="mt-4 text-dhuan">No credential yet. Issue one to begin.</p> : <>
            <pre className="mt-4 max-h-56 overflow-auto rounded bg-black/40 p-3 font-mono text-[11px]">{JSON.stringify({ payload: cred.payload, sig: cred.sig.slice(0, 32) + "…" }, null, 1)}</pre>
            <button className="btn mt-3 !py-1.5 text-sm" onClick={tamper}>Tamper with the subject</button>
          </>}
        </section>
        <section className="sticker p-5" style={{ ["--c" as string]: "#6FD43A" }}>
          <h2 className="font-head text-xl font-bold">2. Selective disclosure and verify</h2>
          {!cred ? <p className="mt-3 text-dhuan">Issue a credential first.</p> : <>
            <p className="mt-2 text-sm text-dhuan">Reveal only what the verifier needs. Hidden claims stay hidden, and the signature still holds because it covers salted commitments.</p>
            {Object.keys(cred.disclosures).map((k) => (
              <label key={k} className="mt-2 flex items-center gap-2 text-sm"><input type="checkbox" checked={reveal.includes(k)} onChange={(e) => setReveal((r) => e.target.checked ? [...r, k] : r.filter((x) => x !== k))} />
                <span className="font-mono">{k}</span><span className="text-dhuan">{reveal.includes(k) ? cred.disclosures[k].value : "hidden"}</span></label>))}
            <button className="btn mt-4 !py-1.5 text-sm" onClick={verify}>Verify</button>
            {res && <div className="mt-4" aria-live="polite">
              <p className="font-glitch text-3xl" style={{ color: res.valid ? "#6FD43A" : "#FF3D8B" }}>{res.valid ? "VERIFIED" : "REJECTED"}</p>
              {res.checks.map((c: any) => <p key={c.name} className="font-mono text-xs">{c.ok ? "✔" : "✘"} {c.name}: {c.detail}</p>)}
              {res.event && <p className="mt-2 text-sm text-haldi">Finding {res.event.event_id}: {res.event.event_type}, risk {res.event.risk.total}/100</p>}
            </div>}
          </>}
        </section>
        <section className="sticker p-5" style={{ ["--c" as string]: "#FFB703" }}>
          <h2 className="font-head text-xl font-bold">3. Document fingerprint</h2>
          <textarea aria-label="Registered version" className="mt-3 w-full rounded bg-black/40 p-2 font-mono text-xs" rows={2} value={fa} onChange={(e) => setFa(e.target.value)} />
          <textarea aria-label="Submitted version" className="mt-2 w-full rounded bg-black/40 p-2 font-mono text-xs" rows={2} value={fb} onChange={(e) => setFb(e.target.value)} />
          <button className="btn mt-3 !py-1.5 text-sm" onClick={async () => setFp(await api({ action: "hash", a: fa, b: fb }))}>Compare SHA-256</button>
          {fp && <div className="mt-3 font-mono text-[11px] break-all"><p>{fp.ha}</p><p>{fp.hb}</p><p className="mt-1 font-bold" style={{ color: fp.same ? "#6FD43A" : "#FF3D8B" }}>{fp.same ? "Identical to the registered version" : "Differs from the registered version"}</p></div>}
          <p className="mt-2 text-xs text-dhuan">A match shows the file is unchanged. It does not show who issued it. That is what the signature check is for.</p>
        </section>
        <section className="sticker p-5" style={{ ["--c" as string]: "#FF3D8B" }}>
          <h2 className="font-head text-xl font-bold">4. Trust registry and history</h2>
          <p className="mt-2 text-sm">NEXUS-CA: <b className="text-nimbu">trusted</b> · IGDTUW-REG: <b className="text-nimbu">trusted</b> · ROGUE-CA: <b className="text-rani">not registered</b></p>
          {hist.length === 0 ? <p className="mt-3 text-dhuan">No verifications yet. Results appear here. History resets on refresh until the database phase.</p> :
            hist.map((h, i) => <p key={i} className="mt-1 font-mono text-xs">{h.at.slice(11, 19)} {h.id} {h.iss} {h.valid ? "✔ valid" : "✘ rejected"}</p>)}
        </section>
      </div>
    </main>
  );
}
