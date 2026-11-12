// Documented risk model. score = 100 * (0.40*severity + 0.30*confidence + 0.30*impact)
// severity: LOW .25, MEDIUM .5, HIGH .75, CRITICAL 1. confidence: detector confidence 0-1.
// impact: 0-1, set per event type in seed (what the asset is worth if exposed). No AI-invented numbers.
export const SEV = { LOW: 0.25, MEDIUM: 0.5, HIGH: 0.75, CRITICAL: 1 } as const;
export const W = { severity: 0.4, confidence: 0.3, impact: 0.3 };
export function score(e: { severity: keyof typeof SEV; confidence: number; impact: number }) {
  const f = [
    { name: "Severity", value: SEV[e.severity], weight: W.severity },
    { name: "Confidence", value: e.confidence, weight: W.confidence },
    { name: "Impact", value: e.impact, weight: W.impact },
  ].map((x) => ({ ...x, points: Math.round(x.value * x.weight * 1000) / 10 }));
  return { total: Math.round(f.reduce((a, x) => a + x.points, 0)), factors: f };
}
