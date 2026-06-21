import { NextResponse } from "next/server";
import { logger } from "./logger";

type Handler = (req: Request, ctx: { params?: Record<string, string> }) => Promise<Response>;

// Wraps a route handler with request-timing logs and a safety net that turns an
// uncaught error into a clean 500 (and a logged event) instead of a stack leak.
export function withApi(name: string, handler: Handler): Handler {
  return async (req, ctx) => {
    const start = Date.now();
    try {
      const res = await handler(req, ctx);
      logger.info("api_request", { route: name, method: req.method, status: res.status, ms: Date.now() - start });
      return res;
    } catch (err) {
      logger.error("api_error", { route: name, method: req.method, err: (err as Error).message, ms: Date.now() - start });
      return NextResponse.json({ error: "server error" }, { status: 500 });
    }
  };
}
