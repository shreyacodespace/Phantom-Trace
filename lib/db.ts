import { neon } from "@neondatabase/serverless";
import { EventSchema, events as seed, type PEvent } from "./seed";
import { score } from "./risk";
// Postgres (Neon) when DATABASE_URL is set, otherwise an in-memory store that only lasts as long as the server process.
export const mode = process.env.DATABASE_URL ? "postgres" : "memory";
const sql: any = process.env.DATABASE_URL ? neon(process.env.DATABASE_URL) : null;
const g = globalThis as any; g.__pt ??= new Map<string, PEvent>();
let ready: Promise<unknown> | null = null;
const init = () => (ready ??= sql`create table if not exists security_events (event_id text primary key, module text not null, data jsonb not null, ts timestamptz not null)`);
const clean = (evs: any[]) => evs.map((e) => EventSchema.safeParse(e)).filter((r) => r.success).map((r) => r.data as PEvent);
export async function save(raw: any[]) {
  const evs = clean(raw);
  try { if (sql) { await init(); for (const e of evs) await sql`insert into security_events (event_id, module, data, ts) values (${e.event_id}, ${e.module}, ${JSON.stringify(e)}::jsonb, ${e.timestamp}) on conflict (event_id) do update set data = excluded.data, ts = excluded.ts`; } else evs.forEach((e) => g.__pt.set(e.event_id, e)); }
  catch (err) { console.error("save failed", err); }
}
export async function replaceModule(module: string, raw: any[]) {
  try { if (sql) { await init(); await sql`delete from security_events where module = ${module}`; } else for (const [k, v] of g.__pt) if (v.module === module) g.__pt.delete(k); } catch (err) { console.error(err); }
  await save(raw);
}
export async function list(): Promise<PEvent[]> {
  try { if (sql) { await init(); return (await sql`select data from security_events order by ts desc`).map((r: any) => r.data); } } catch (err) { console.error(err); }
  return [...g.__pt.values()].sort((a: PEvent, b: PEvent) => b.timestamp.localeCompare(a.timestamp));
}
export async function reset() { try { if (sql) { await init(); await sql`delete from security_events`; } } catch {} g.__pt.clear(); }
export const loadSeed = () => save(seed);
export const withRisk = (evs: PEvent[]) => evs.map((e) => ({ ...e, risk: score(e) }));
// Audit log: who did what. Stored in Postgres when available.
g.__ptAudit ??= [] as { ts: string; actor: string; action: string }[];
export async function audit(actor: string, action: string) {
  const row = { ts: new Date().toISOString(), actor, action };
  try { if (sql) { await sql`create table if not exists audit_logs (id serial primary key, ts timestamptz not null, actor text not null, action text not null)`; await sql`insert into audit_logs (ts, actor, action) values (${row.ts}, ${actor}, ${action})`; return; } } catch (e) { console.error(e); }
  g.__ptAudit.unshift(row); g.__ptAudit.length = Math.min(g.__ptAudit.length, 50);
}
export async function auditList(): Promise<{ ts: string; actor: string; action: string }[]> {
  try { if (sql) { await sql`create table if not exists audit_logs (id serial primary key, ts timestamptz not null, actor text not null, action text not null)`; return (await sql`select ts, actor, action from audit_logs order by ts desc limit 10`).map((r: any) => ({ ...r, ts: new Date(r.ts).toISOString() })); } } catch {}
  return g.__ptAudit.slice(0, 10);
}
