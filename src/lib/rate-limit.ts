// Fixed-window rate limiter. In-memory and per-instance — fine for a single
// node; for multi-instance/serverless use a shared store (Upstash/Redis) with
// the same interface. The `now` parameter keeps it deterministic for tests.
interface Bucket { count: number; resetAt: number; }
const store = new Map<string, Bucket>();

export interface RateResult { ok: boolean; remaining: number; retryAfterMs: number; }

export function rateLimit(key: string, limit = 5, windowMs = 60_000, now = Date.now()): RateResult {
  const b = store.get(key);
  if (!b || now >= b.resetAt) {
    store.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true, remaining: limit - 1, retryAfterMs: 0 };
  }
  if (b.count >= limit) {
    return { ok: false, remaining: 0, retryAfterMs: b.resetAt - now };
  }
  b.count++;
  return { ok: true, remaining: limit - b.count, retryAfterMs: 0 };
}

// Pull the caller's IP from common proxy headers.
export function clientIp(req: Request): string {
  const xff = req.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0].trim();
  return req.headers.get("x-real-ip") ?? "unknown";
}

// Test helper.
export function _resetRateStore() { store.clear(); }
