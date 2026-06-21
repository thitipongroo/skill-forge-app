// AI coach helpers — pure prompt builder + response parser. The route in
// /api/ai/coach makes the actual Anthropic API call; keeping these pure makes
// them unit-testable without the network.
export interface CoachPlan { subskills: string[]; reviews: string[]; tip: string; }

export function buildCoachPrompt({ name, why }: { name: string; why?: string }): string {
  return (
    `You are a learning coach. A learner wants to build the skill: "${name}".` +
    (why ? ` Their reason: "${why}".` : "") +
    `\nBreak it into 5-8 concrete sub-skills to practise, and 4-6 specific things worth ` +
    `memorising and reviewing (concepts, facts, patterns), plus one short first-session tip.` +
    `\nRespond with ONLY a JSON object: {"subskills": string[], "reviews": string[], "tip": string}. ` +
    `No prose, no markdown.`
  );
}

// Tolerates markdown fences / surrounding prose around the JSON object.
export function parseCoachResponse(text: string): CoachPlan {
  const match = text.match(/\{[\s\S]*\}/);
  const obj = JSON.parse(match ? match[0] : text);
  const clean = (x: unknown): string[] =>
    Array.isArray(x)
      ? x.filter((s): s is string => typeof s === "string").map((s) => s.trim()).filter(Boolean).slice(0, 12)
      : [];
  return {
    subskills: clean(obj.subskills),
    reviews: clean(obj.reviews),
    tip: typeof obj.tip === "string" ? obj.tip.trim() : "",
  };
}
