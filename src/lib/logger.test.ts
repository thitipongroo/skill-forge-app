import { describe, it, expect, vi, beforeEach } from "vitest";
import { logger } from "./logger";

beforeEach(() => { delete process.env.LOG_LEVEL; });

describe("logger", () => {
  it("emits structured JSON at info level", () => {
    const spy = vi.spyOn(console, "log").mockImplementation(() => {});
    logger.info("hello", { a: 1 });
    expect(spy).toHaveBeenCalledOnce();
    const obj = JSON.parse(spy.mock.calls[0][0] as string);
    expect(obj).toMatchObject({ level: "info", msg: "hello", a: 1 });
    expect(typeof obj.time).toBe("string");
    spy.mockRestore();
  });

  it("filters messages below the configured level", () => {
    process.env.LOG_LEVEL = "warn";
    const spy = vi.spyOn(console, "log").mockImplementation(() => {});
    logger.info("suppressed");
    expect(spy).not.toHaveBeenCalled();
    spy.mockRestore();
  });

  it("routes errors to console.error", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    logger.error("boom", { code: 500 });
    expect(spy).toHaveBeenCalledOnce();
    spy.mockRestore();
  });
});
