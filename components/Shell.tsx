"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Network, Eye, ShieldCheck, Database, VenetianMask, FileText } from "lucide-react";
import { useEffect, useState } from "react";
const NAV = [
  { t: "Dashboard", h: "/command", I: LayoutDashboard }, { t: "Investigation graph", h: "/graph", I: Network }, { g: "Modules" },
  { t: "Afterimage", h: "/afterimage", I: Eye }, { t: "Trustless", h: "/trustless", I: ShieldCheck }, { t: "Phantom Data", h: "/phantomdata", I: Database },
  { t: "Deception Lab", h: "/deceptionlab", I: VenetianMask }, { g: "Output" }, { t: "Reports", h: "/reports", I: FileText },
] as any[];
export default function Shell() {
  const path = usePathname(); const [high, setHigh] = useState(0);
  useEffect(() => { fetch("/api/events", { cache: "no-store" }).then((r) => r.json()).then((j) => setHigh(j.events.filter((e: any) => e.risk.total >= 70).length)).catch(() => {}); }, [path]);
  const items = NAV.map((n, i) => n.g ? <p key={i} className="mt-5 px-3 font-mono text-[10px] text-dhuan">{n.g}</p> :
    <Link key={n.h} href={n.h} aria-current={path === n.h ? "page" : undefined} className={`flex items-center gap-3 whitespace-nowrap rounded-lg border px-3 py-2 text-sm ${path === n.h ? "border-nimbu/60 bg-nimbu/10 text-nimbu" : "border-transparent text-safed/80 hover:bg-white/5"}`}><n.I size={16} />{n.t}</Link>);
  return (<>
    <aside className="noprint fixed inset-y-0 left-0 z-20 hidden w-56 flex-col border-r border-white/10 bg-[#0a0910]/95 p-4 md:flex">
      <Link href="/"><img src="/logo.png" alt="Phantom Trace" className="w-full mix-blend-screen" /></Link>
      <nav className="mt-6 flex flex-col gap-1">{items}</nav>
      <img src="/gate.jpg" alt="" className="mt-auto w-full opacity-70" /><button onClick={async () => { await fetch("/api/login", { method: "POST", body: JSON.stringify({ logout: true }) }); location.href = "/login"; }} className="mt-2 text-left text-xs text-dhuan underline">Sign out</button>
      <p className="mt-4 border-l-2 border-nimbu pl-3 font-head text-sm">Secure Bharat.<br />Digitally.</p>
    </aside>
    <div className="noprint sticky top-0 z-20 flex items-center gap-2 overflow-x-auto border-b border-white/10 bg-kaala/95 p-2 md:hidden">{items.filter((x) => x.key !== "0")}</div>
    <div className="noprint absolute right-5 top-4 hidden items-center gap-3 md:flex">
      <span className="rounded-full border border-haldi/60 px-3 py-1 font-mono text-xs text-haldi">Simulated data</span>
      <Link href="/command" aria-label={`${high} high-risk findings`} className="relative rounded-full border border-white/15 px-2.5 py-1.5 text-sm">🔔<span className="absolute -right-1 -top-1 rounded-full bg-rani px-1.5 text-[10px]">{high}</span></Link>
    </div></>);
}
