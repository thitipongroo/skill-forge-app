import { describe, it, expect, beforeEach } from "vitest";
import { rateLimit, _resetRateStore } from "./rate-limit";

beforeEach(() => _resetRateStore());

describe("rateLimit", () => {
  it("allows up to the limit, then blocks", () => {
    const k = "ip:a";
    for (let i = 0; i < 3; i++) expect(rateLimit(k, 3, 1000, 1000).ok).toBe(true);
    const blocked = rateLimit(k, 3, 1000, 1000);
    expect(blocked.ok).toBe(false);
    expect(blocked.retryAfterMs).toBeGreaterThan(0);
  });

  it("decrements remaining", () => {
    const k = "ip:b";
    expect(rateLimit(k, 5, 1000, 1000).remaining).toBe(4);
    expect(rateLimit(k, 5, 1000, 1000).remaining).toBe(3);
  });

  it("resets after the window elapses", () => {
    const k = "ip:c";
    expect(rateLimit(k, 1, 1000, 1000).ok).toBe(true);   // consumes the 1 slot
    expect(rateLimit(k, 1, 1000, 1500).ok).toBe(false);  // still inside window
    expect(rateLimit(k, 1, 1000, 2000).ok).toBe(true);   // window elapsed -> reset
  });

  it("keys are independent", () => {
    expect(rateLimit("ip:x", 1, 1000, 1000).ok).toBe(true);
    expect(rateLimit("ip:y", 1, 1000, 1000).ok).toBe(true);
  });
});
