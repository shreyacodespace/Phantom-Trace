// Unsupervised anomaly detection: an Isolation Forest written from scratch (Liu et al., 2008).
// Trained on a SYNTHETIC baseline of ordinary sessions (seeded, reproducible). It is a demo model, not a production detector.
type Row = { ts: string; type: string; resource: string; status: string };
export const ML_THRESHOLD = 0.6;
const NAMES = ["login attempts per minute", "distinct resources", "error rate", "requests per minute"];
const rng = (s: number) => () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
export function features(xs: Row[]) {
  const t = xs.map((x) => Date.parse(x.ts)), span = Math.max(60, (Math.max(...t) - Math.min(...t)) / 1000), min = span / 60;
  return [xs.filter((x) => x.type === "login_attempt").length / min, new Set(xs.map((x) => x.resource)).size, xs.filter((x) => x.status !== "200").length / xs.length, xs.length / min];
}
type N = { f?: number; v?: number; l?: N; r?: N; size: number };
const c = (n: number) => (n <= 1 ? 0 : 2 * (Math.log(n - 1) + 0.5772156649) - (2 * (n - 1)) / n);
function build(X: number[][], d: number, max: number, r: () => number): N {
  if (d >= max || X.length <= 1) return { size: X.length };
  const f = Math.floor(r() * X[0].length), v = X.map((x) => x[f]), lo = Math.min(...v), hi = Math.max(...v);
  if (lo === hi) return { size: X.length };
  const cut = lo + r() * (hi - lo);
  return { size: X.length, f, v: cut, l: build(X.filter((x) => x[f] < cut), d + 1, max, r), r: build(X.filter((x) => x[f] >= cut), d + 1, max, r) };
}
const depth = (x: number[], n: N, d = 0): number => (n.f === undefined ? d + c(n.size) : depth(x, x[n.f] < n.v! ? n.l! : n.r!, d + 1));
let model: { trees: N[]; mean: number[]; sd: number[] } | null = null;
function train() {
  const r = rng(42), base = Array.from({ length: 500 }, () => { const n = 1 + Math.floor(r() * 6); return [Math.floor(r() * Math.min(n, 3)) * (0.5 + r()), Math.min(n, 1 + Math.floor(r() * 3)), r() * 0.6, n * (0.4 + r() * 0.8)]; });
  const trees = Array.from({ length: 100 }, () => build([...base].sort(() => r() - 0.5).slice(0, 128), 0, 7, r));
  const mean = NAMES.map((_, i) => base.reduce((a, b) => a + b[i], 0) / base.length);
  const sd = NAMES.map((_, i) => Math.sqrt(base.reduce((a, b) => a + (b[i] - mean[i]) ** 2, 0) / base.length) || 1);
  return (model = { trees, mean, sd });
}
export function mlScore(xs: Row[]) {
  const m = model ?? train(), x = features(xs), avg = m.trees.reduce((a, t) => a + depth(x, t), 0) / m.trees.length;
  const z = x.map((v, i) => Math.abs(v - m.mean[i]) / m.sd[i]), k = z.indexOf(Math.max(...z));
  return { score: Math.round(2 ** (-avg / c(128)) * 100) / 100, top: NAMES[k], value: Math.round(x[k] * 10) / 10 };
}
