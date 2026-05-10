import { NextResponse } from "next/server";
import { ZodError } from "zod";

export function apiError(e: unknown) {
  if (e instanceof ZodError) {
    const msg = e.issues.map((i) => `${i.path.join(".") || "field"}: ${i.message}`).join("; ");
    return NextResponse.json({ error: msg || "Invalid request" }, { status: 400 });
  }
  if (e instanceof Error) {
    if (e.message === "UNAUTHORIZED") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (/not found/i.test(e.message)) return NextResponse.json({ error: e.message }, { status: 404 });
    return NextResponse.json({ error: e.message || "Request failed" }, { status: 400 });
  }
  return NextResponse.json({ error: "Unknown error" }, { status: 500 });
}

type Handler<C> = (req: Request, ctx: C) => Promise<Response> | Response;

/** Wraps a route handler with consistent error handling. */
export function safe<C = any>(fn: Handler<C>): Handler<C> {
  return async (req, ctx) => {
    try {
      return await fn(req, ctx);
    } catch (e) {
      // Only log unexpected errors. ZodError and known auth errors are
      // user-driven and would just create noise in production logs.
      if (
        !(e instanceof ZodError) &&
        !(e instanceof Error && (e.message === "UNAUTHORIZED" || /not found/i.test(e.message)))
      ) {
        console.error("[api]", e);
      }
      return apiError(e);
    }
  };
}
