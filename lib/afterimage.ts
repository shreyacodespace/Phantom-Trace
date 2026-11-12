import exifr from "exifr";
import { score, SEV } from "./risk";
import { sha } from "./trust";
type Sev = keyof typeof SEV;
const D = [[0,1,2,3,4,5,6,7,8,9],[1,2,3,4,0,6,7,8,9,5],[2,3,4,0,1,7,8,9,5,6],[3,4,0,1,2,8,9,5,6,7],[4,0,1,2,3,9,5,6,7,8],[5,9,8,7,6,0,4,3,2,1],[6,5,9,8,7,1,0,4,3,2],[7,6,5,9,8,2,1,0,4,3],[8,7,6,5,9,3,2,1,0,4],[9,8,7,6,5,4,3,2,1,0]];
const P = [[0,1,2,3,4,5,6,7,8,9],[1,5,7,6,2,8,3,0,9,4],[5,8,0,3,7,9,6,1,4,2],[8,9,1,6,0,4,3,5,2,7],[9,4,5,3,1,2,6,8,7,0],[4,2,8,6,5,7,3,9,0,1],[2,7,9,3,8,0,6,4,1,5],[7,0,4,6,9,1,3,2,5,8]];
export const verhoeff = (s: string) => { let c = 0; [...s].reverse().forEach((ch, i) => { c = D[c][P[i % 8][+ch]]; }); return c === 0; };
const mask = (v: string) => (v.length <= 4 ? "••••" : v.slice(0, 2) + "•".repeat(Math.min(v.length - 4, 12)) + v.slice(-2));
const RULES: { cat: string; re: RegExp; sev: Sev; conf: number; imp: number; why: string; fix: string }[] = [
  { cat: "Email", re: /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g, sev: "MEDIUM", conf: 0.95, imp: 0.5, why: "Email addresses link a document to a person and can be used for phishing.", fix: "Replace with a role address or remove it." },
  { cat: "Phone", re: /(?<!\d)(?:\+91[\s-]?)?[6-9]\d{4}[\s-]?\d{5}(?!\d)/g, sev: "MEDIUM", conf: 0.8, imp: 0.55, why: "Matches the Indian mobile number format. It could be a different 10-digit number.", fix: "Remove or mask all but the last two digits." },
  { cat: "Aadhaar-format ID", re: /(?<!\d)[1-9]\d{3}\s?\d{4}\s?\d{4}(?!\d)/g, sev: "CRITICAL", conf: 0.5, imp: 1, why: "12-digit number in Aadhaar layout.", fix: "Redact fully. Share a masked copy that shows only the last four digits." },
  { cat: "PAN-format ID", re: /\b[A-Z]{5}\d{4}[A-Z]\b/g, sev: "HIGH", conf: 0.85, imp: 0.9, why: "Matches the PAN format (5 letters, 4 digits, 1 letter).", fix: "Redact before sharing." },
  { cat: "Internal hostname", re: /\b[a-z0-9-]+(?:\.[a-z0-9-]+)*\.(?:internal|corp|lan|local)\b/gi, sev: "HIGH", conf: 0.9, imp: 0.7, why: "Reveals private network naming that helps someone map your infrastructure.", fix: "Remove it, or replace it with a generic name." },
  { cat: "Private IP", re: /\b(?:10|192\.168|172\.(?:1[6-9]|2\d|3[01]))(?:\.\d{1,3}){2,3}\b/g, sev: "MEDIUM", conf: 0.85, imp: 0.5, why: "Internal address that reveals network layout.", fix: "Remove it." },
  { cat: "User folder path", re: /(?:C:\\Users\\|\/home\/|\/Users\/)([A-Za-z0-9._-]+)/g, sev: "MEDIUM", conf: 0.9, imp: 0.45, why: "A file path often contains a real account name.", fix: "Re-export the file from a clean template." },
];
const META: Record<string, { cat: string; sev: Sev; conf: number; imp: number; why: string; fix: string }> = {
  Author: { cat: "Author name", sev: "MEDIUM", conf: 0.9, imp: 0.5, why: "Names the person who created the file.", fix: "Clear the author field before sharing." },
  Artist: { cat: "Author name", sev: "MEDIUM", conf: 0.9, imp: 0.5, why: "Names the person who made the image.", fix: "Strip EXIF." },
  Creator: { cat: "Software fingerprint", sev: "LOW", conf: 0.85, imp: 0.25, why: "Shows which software and version made the file.", fix: "Strip metadata." },
  Producer: { cat: "Software fingerprint", sev: "LOW", conf: 0.85, imp: 0.25, why: "Shows which software and version made the file.", fix: "Strip metadata." },
  Software: { cat: "Software fingerprint", sev: "LOW", conf: 0.85, imp: 0.25, why: "Shows which software made the file.", fix: "Strip metadata." },
  Make: { cat: "Device", sev: "LOW", conf: 0.9, imp: 0.3, why: "Identifies the device that took the photo.", fix: "Strip EXIF." },
  Model: { cat: "Device", sev: "LOW", conf: 0.9, imp: 0.3, why: "Identifies the device that took the photo.", fix: "Strip EXIF." },
  CreationDate: { cat: "Timestamp", sev: "LOW", conf: 0.9, imp: 0.2, why: "Shows when the file was made.", fix: "Strip metadata." },
  ModDate: { cat: "Timestamp", sev: "LOW", conf: 0.9, imp: 0.2, why: "Shows when the file was last edited.", fix: "Strip metadata." },
  DateTimeOriginal: { cat: "Timestamp", sev: "LOW", conf: 0.9, imp: 0.2, why: "Shows when the photo was taken.", fix: "Strip EXIF." },
};
export async function analyse(buf: Buffer, kind: "pdf" | "jpeg" | "png" | "text") {
  const meta: Record<string, string> = {}; let text = ""; const notes: string[] = [];
  if (kind === "pdf") {
    text = buf.toString("latin1");
    for (const k of ["Author", "Creator", "Producer", "CreationDate", "ModDate", "Title"]) { const m = text.match(new RegExp(`/${k}\\s*\\(([^)]*)\\)`)); if (m?.[1]) meta[k] = m[1]; }
    notes.push("Only uncompressed PDF text and the Info dictionary were scanned. Compressed content streams were not read.");
  } else if (kind === "text") text = buf.toString("utf8");
  else {
    try { const x: any = await exifr.parse(buf, { gps: true, tiff: true, exif: true }); for (const k of ["Make", "Model", "Software", "Artist", "DateTimeOriginal"]) if (x?.[k]) meta[k] = String(x[k]); if (x?.latitude != null) meta.GPS = `${x.latitude.toFixed(4)}, ${x.longitude.toFixed(4)}`; } catch { notes.push("EXIF could not be parsed."); }
  }
  const raw: { cat: string; src: string; value: string; sev: Sev; conf: number; imp: number; why: string; fix: string }[] = [];
  for (const [k, v] of Object.entries(meta)) {
    if (k === "GPS") raw.push({ cat: "GPS location", src: "metadata:GPS", value: v, sev: "HIGH", conf: 0.97, imp: 0.85, why: "Gives the place where the photo was taken, possibly a home or office.", fix: "Strip EXIF GPS before sharing." });
    else if (META[k]) { const r = META[k]; raw.push({ cat: r.cat, src: "metadata:" + k, value: v, sev: r.sev, conf: r.conf, imp: r.imp, why: r.why, fix: r.fix }); }
  }
  const scan = (s: string, src: string) => { for (const r of RULES) for (const m of s.matchAll(r.re)) {
    let { sev, conf } = r;
    if (r.cat.startsWith("Aadhaar")) { const ok = verhoeff(m[0].replace(/\s/g, "")); conf = ok ? 0.9 : 0.3; sev = ok ? "CRITICAL" : "MEDIUM"; }
    raw.push({ cat: r.cat, src, value: m[0], sev, conf, imp: r.imp, why: r.why + (r.cat.startsWith("Aadhaar") ? (conf > 0.5 ? " The checksum is valid." : " The checksum is invalid, so it may not be an ID.") : ""), fix: r.fix }); } };
  scan(text, "content"); for (const [k, v] of Object.entries(meta)) scan(v, "metadata:" + k);
  const doc = "DOC-" + sha(buf.toString("base64")).slice(0, 6).toUpperCase(), now = new Date().toISOString();
  const findings = raw.map((r, i) => { const e = { sev: r.sev, severity: r.sev, confidence: r.conf, impact: r.imp };
    return { event_id: `EVT-A-${doc.slice(4)}-${i + 1}`, module: "AFTERIMAGE" as const, event_type: r.cat.toUpperCase().replace(/[^A-Z]+/g, "_") + "_EXPOSURE", entity_id: doc, severity: r.sev, confidence: r.conf, impact: r.imp, timestamp: now,
      evidence_refs: [r.src], description: `${r.cat} found in ${r.src}: ${mask(r.value)}`, recommended_action: r.fix, reason: r.why, risk: score(e) }; });
  const cats = [...new Set(raw.map((r) => r.cat))];
  const nodes = [{ id: doc, type: "document" }, ...findings.map((f) => ({ id: f.event_id, type: "event" }))];
  const edges = findings.map((f) => ({ s: f.event_id, t: doc, kind: "observed" }));
  if (cats.length >= 3) { nodes.push({ id: "CUMULATIVE", type: "hypothesis" }); findings.forEach((f) => edges.push({ s: f.event_id, t: "CUMULATIVE", kind: "inferred" })); notes.push(`Cumulative exposure (inferred): ${cats.length} kinds of identifying detail in one file make it easier to single someone out. This does not confirm any identity.`); }
  return { doc, kind, meta: Object.fromEntries(Object.entries(meta).map(([k, v]) => [k, v])), findings, graph: { nodes, edges }, notes };
}
