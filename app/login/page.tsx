"use client";
import { useState } from "react";
export default function Login() {
  const [u, setU] = useState("analyst"); const [p, setP] = useState(""); const [err, setErr] = useState(""); const [busy, setBusy] = useState(false);
  async function go(e: React.FormEvent) {
    e.preventDefault(); setBusy(true); setErr("");
    const r = await fetch("/api/login", { method: "POST", body: JSON.stringify({ username: u, password: p }) });
    if (r.ok) location.href = "/command"; else { setErr((await r.json()).error); setBusy(false); }
  }
  return (
    <main className="app grid min-h-screen place-items-center px-5">
      <form onSubmit={go} className="sticker w-full max-w-sm p-6" style={{ ["--c" as string]: "#6FD43A" }}>
        <h1 className="font-glitch text-3xl">PHANTOM <span className="text-nimbu">TRACE</span></h1>
        <p className="font-desi text-rani">फैंटम ट्रेस</p>
        <label className="mt-5 block text-sm">Role<select value={u} onChange={(e) => setU(e.target.value)} className="mt-1 w-full rounded-lg bg-black/40 p-2"><option value="analyst">analyst (run modules)</option><option value="admin">admin (also reset workspace)</option></select></label>
        <label className="mt-3 block text-sm">Password<input type="password" value={p} onChange={(e) => setP(e.target.value)} className="mt-1 w-full rounded-lg bg-black/40 p-2" autoComplete="current-password" /></label>
        {err && <p role="alert" className="mt-3 text-sm text-rani">{err}</p>}
        <button className="btn mt-5 w-full justify-center" disabled={busy}>{busy ? "Signing in…" : "Sign in"}</button>
      </form>
    </main>
  );
}
