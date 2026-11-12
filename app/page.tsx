import Link from "next/link";
import { Squiggle, Star, Nazar, Paisley } from "@/components/Doodles";
import { Eye, ShieldCheck, Database, VenetianMask, ArrowUpRight, ChevronRight, ChevronDown } from "lucide-react";
const G = "#6FD43A", V = "#8B5CF6";
const mods = [
  { n: "AFTERIMAGE", d: "Map digital footprints.", h: "/afterimage", c: G, I: Eye },
  { n: "TRUSTLESS", d: "Verify identities.", h: "/trustless", c: V, I: ShieldCheck },
  { n: "PHANTOM DATA", d: "Track data flows.", h: "/phantomdata", c: G, I: Database },
  { n: "DECEPTION LAB", d: "Spot suspicious behaviour.", h: "/deceptionlab", c: V, I: VenetianMask },
];
const feats = [
  ["Real signatures", "Ed25519 credential checks against a trust registry. A hash alone never decides authenticity."],
  ["Explainable risk", "Every score shows severity, confidence and impact, with the formula on the page."],
  ["Isolation Forest", "An unsupervised model flags unusual decoy behaviour that the fixed rules miss."],
  ["Neo4j graph", "Findings become entities and links you can query. Inferred links are labelled as such."],
  ["Grok briefings", "Optional AI explanations that must label what is observed, inferred or a hypothesis."],
  ["Privacy first", "Synthetic data, files processed in memory, passwords never stored by the decoy."],
];
export default function Home() {
  return (
    <main className="relative overflow-x-hidden bg-black">
      <header className="relative z-20 mx-auto flex max-w-[1500px] items-center justify-between px-5 py-4 md:px-10">
        <Link href="/"><img src="/logo.png" alt="Phantom Trace" className="h-14 mix-blend-screen" /></Link>
        <nav className="hidden items-center gap-9 rounded-xl border border-white/10 bg-white/[.03] px-8 py-3 font-head text-sm md:flex">
          <Link href="/" className="border-b-2 border-[#6FD43A] pb-1 text-[#6FD43A]">Home</Link>
          <div className="group relative"><button className="flex items-center gap-1">Modules <ChevronDown size={14} /></button>
            <div className="invisible absolute left-0 top-full z-30 w-48 rounded-lg border border-white/10 bg-[#0b0b0f] p-2 opacity-0 group-focus-within:visible group-focus-within:opacity-100 group-hover:visible group-hover:opacity-100">
              {mods.map((m) => <Link key={m.h} href={m.h} className="block rounded px-3 py-2 hover:bg-white/5">{m.n}</Link>)}</div></div>
          <Link href="/graph">Investigation</Link><Link href="/reports">Reports</Link><a href="#about">About</a>
        </nav>
        <Link href="/command" className="cutw" style={{ ["--c" as string]: G }}><span className="cut"><span className="in !flex items-center gap-3 !py-2.5 font-head text-sm text-[#6FD43A]">Launch Console <ChevronRight size={16} /></span></span></Link>
      </header>
      <section className="relative mx-auto max-w-[1500px] px-5 pb-10 pt-6 md:px-10 md:pt-12">
        <div className="pointer-events-none absolute right-0 top-0 w-full opacity-45 md:w-[min(64%,980px)] md:opacity-100" style={{ aspectRatio: "792/615" }}>
          <img src="/hero-art.jpg" alt="" className="h-full w-full object-cover [mask-image:linear-gradient(to_right,transparent,black_28%,black_92%,transparent)]" />
          <div className="absolute hidden rounded-xl border border-white/15 bg-[#09090b] p-3 font-mono text-[11px] md:block" style={{ left: "69.5%", top: "59.5%", width: "26.5%" }}>
            <p className="flex items-center gap-2 text-dhuan"><span className="h-2 w-2 rounded-full bg-[#6FD43A]" />DEMO MODE</p><p className="mt-1 font-head text-sm text-safed">Synthetic data only</p></div>
        </div>
        <div className="relative z-10 max-w-3xl">
          <p className="inline-flex items-center gap-2 rounded border border-white/15 bg-black/60 px-3 py-1.5 font-mono text-xs"><span className="h-2 w-2 rounded-full bg-[#6FD43A]" />CYBER INTELLIGENCE PLATFORM<span className="h-2 w-2 rounded-full bg-dhuan" /></p>
          <h1 className="mt-4 font-title font-black leading-[.95] tracking-tight" style={{ fontSize: "clamp(2.6rem,8.6vw,7.6rem)" }}><span className="metal block">PHANTOM</span><span className="verd block">TRACE</span></h1>
          <p className="mt-6 font-head text-3xl text-safed/90 md:text-5xl">Discover. Verify. Track. <span className="text-[#6FD43A]">Defend.</span></p>
          <p className="mt-6 max-w-md text-lg text-dhuan">Every digital action leaves a trace.<br />We connect the <span className="text-[#6FD43A]">unseen</span>.</p>
          <Link href="/command" className="cutw mt-8 inline-block" style={{ ["--c" as string]: V }}><span className="cut"><span className="in !flex items-center gap-8 !py-3 font-head text-[#6FD43A]">Explore the Threats <ChevronRight size={18} /></span></span></Link>
        </div>
      </section>
      <section className="relative z-10 mx-auto grid max-w-[1500px] gap-5 px-5 pb-14 md:grid-cols-2 md:px-10 lg:grid-cols-[repeat(4,1fr)_1.1fr]">
        {mods.map((m) => (
          <Link key={m.n} href={m.h} className="cutw block" style={{ ["--c" as string]: m.c }}>
            <span className="cut"><span className="in relative block min-h-[170px]"><m.I size={34} color={m.c} /><b className="mt-5 block font-head text-lg tracking-wide">{m.n}</b><span className="mt-1 block text-sm text-dhuan">{m.d}</span><ArrowUpRight className="absolute bottom-4 right-4" size={22} color={m.c} /></span></span>
          </Link>))}
        <div className="flex flex-col justify-center border-white/10 pl-2 lg:border-l lg:pl-8"><h2 className="font-head text-3xl leading-tight text-safed/90">Four Dimensions.<br />One Unified Defence.</h2></div>
      </section>
      <section className="mx-auto max-w-[1500px] px-5 py-14 md:px-10">
        <p className="font-mono text-xs text-[#6FD43A]">ARCHITECTURE</p><h2 className="mt-2 font-head text-3xl md:text-4xl">Four modules feed one investigation.</h2>
        <div className="mt-8 grid items-stretch gap-4 md:grid-cols-[1fr_auto_1fr_auto_1fr]">
          <div className="grid grid-cols-2 gap-3">{mods.map((m) => <div key={m.n} className="rounded-lg border p-3 font-mono text-xs" style={{ borderColor: m.c + "88" }}>{m.n}</div>)}</div>
          <ChevronRight className="hidden self-center text-dhuan md:block" />
          <div className="rounded-lg border border-[#6FD43A]/60 p-5"><b className="font-head">Unified intelligence engine</b><p className="mt-2 text-sm text-dhuan">One event format, risk scoring, correlation. Observed, inferred and hypothesis are kept apart.</p></div>
          <ChevronRight className="hidden self-center text-dhuan md:block" />
          <div className="rounded-lg border border-[#8B5CF6]/60 p-5"><b className="font-head">Graph, timeline, report</b><p className="mt-2 text-sm text-dhuan">Neo4j relationships, evidence references and a printable report.</p></div>
        </div>
      </section>
      <section className="mx-auto max-w-[1500px] px-5 py-10 md:px-10">
        <p className="font-mono text-xs text-[#8B5CF6]">FEATURES</p>
        <div className="mt-6 grid gap-5 md:grid-cols-2 lg:grid-cols-3">{feats.map(([t, d], i) => <div key={t} className="cutw" style={{ ["--c" as string]: i % 2 ? V : G }}><div className="cut"><div className="in"><b className="font-head text-lg">{t}</b><p className="mt-2 text-sm text-dhuan">{d}</p></div></div></div>)}</div>
      </section>
      <Squiggle className="mx-auto w-40 text-[#8B5CF6]/60" />
      <section id="about" className="relative mx-auto max-w-[1500px] px-5 py-14 md:px-10">
        <Paisley className="pointer-events-none absolute right-10 top-6 hidden h-28 text-[#6FD43A]/25 md:block" /><Star className="pointer-events-none absolute right-48 top-24 hidden h-8 text-[#8B5CF6]/40 md:block" /><Nazar className="pointer-events-none absolute right-24 bottom-8 hidden h-12 text-[#FFB703]/40 md:block" />
        <p className="font-mono text-xs text-[#6FD43A]">RESEARCH AND TECHNOLOGY</p>
        <p className="mt-3 max-w-2xl text-dhuan">Built for HACKRUSH 2026 by Tech4Hack, IGDTUW. The platform connects digital exposure, identity trust, data movement and behavioural threats so a security team sees one story instead of four reports.</p>
        <div className="mt-5 flex flex-wrap gap-2 font-mono text-xs">{["Next.js", "TypeScript", "Tailwind", "Cytoscape.js", "Apache ECharts", "Neo4j", "PostgreSQL", "Isolation Forest", "Ed25519", "Grok API"].map((t) => <span key={t} className="rounded border border-white/15 px-3 py-1">{t}</span>)}</div>
        <p className="font-desi mt-10 text-2xl text-[#6FD43A]">सतर्क रहें · सुरक्षित रहें</p>
      </section>
      <footer className="border-t border-white/10 px-5 py-6 text-center font-mono text-xs text-dhuan">All demo data is synthetic · Secure Bharat. Digitally.</footer>
    </main>
  );
}
