import { buildGraph } from "./correlate";
import type { PEvent } from "./seed";
// Neo4j through its HTTPS Query API (works from serverless). Falls back to a local calculation when not configured.
const uri = process.env.NEO4J_URI, pass = process.env.NEO4J_PASSWORD, user = process.env.NEO4J_USER || "neo4j", dbn = process.env.NEO4J_DATABASE || "neo4j";
export const neoOn = !!(uri && pass);
async function run(statement: string, parameters: object = {}) {
  const host = uri!.replace(/^[a-z+]+:\/\//, "").replace(/[/:].*$/, "");
  const r = await fetch(`https://${host}/db/${dbn}/query/v2`, { method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json", Authorization: "Basic " + Buffer.from(`${user}:${pass}`).toString("base64") }, body: JSON.stringify({ statement, parameters }) });
  if (!r.ok) throw new Error("Neo4j HTTP " + r.status);
  return (await r.json()).data as { values: any[][] };
}
export async function graphInfo(evs: PEvent[]) {
  const g = buildGraph(evs), deg: Record<string, number> = {};
  g.edges.forEach((e) => { deg[e.s] = (deg[e.s] ?? 0) + 1; deg[e.t] = (deg[e.t] ?? 0) + 1; });
  const local = g.nodes.filter((n) => n.type !== "event").map((n) => ({ id: n.id, degree: deg[n.id] ?? 0 })).sort((a, b) => b.degree - a.degree).slice(0, 5);
  const base = { nodes: g.nodes.length, edges: g.edges.length };
  if (!neoOn) return { source: "local calculation (Neo4j not configured)", ranking: local, ...base };
  try {
    await run("MATCH (n:PT) DETACH DELETE n"); // only touches nodes this app created
    await run("UNWIND $n AS n CREATE (:PT {id: n.id, type: n.type})", { n: g.nodes });
    await run("UNWIND $e AS e MATCH (a:PT {id: e.s}), (b:PT {id: e.t}) CREATE (a)-[:LINK {kind: e.kind}]->(b)", { e: g.edges });
    const d = await run("MATCH (n:PT) WHERE n.type <> 'event' OPTIONAL MATCH (n)-[r:LINK]-() RETURN n.id AS id, count(r) AS degree ORDER BY degree DESC LIMIT 5");
    return { source: "Neo4j", ranking: d.values.map((v) => ({ id: v[0], degree: v[1] })), ...base };
  } catch (e) { console.error(e); return { source: "local calculation (Neo4j request failed)", ranking: local, ...base }; }
}
