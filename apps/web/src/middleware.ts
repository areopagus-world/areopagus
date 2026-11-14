import { NextResponse, type NextRequest } from "next/server";
import { canonicalRedirect } from "./identity/canonical";

/** One address for everything: side hosts (www, beta) answer with a permanent redirect to the main one. */
export function middleware(request: NextRequest) {
  const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host") ?? "";
  const target = canonicalRedirect(
    host,
    request.nextUrl.pathname + request.nextUrl.search,
    process.env.APP_ORIGIN,
  );
  return target ? NextResponse.redirect(target, 308) : NextResponse.next();
}

// The health check keeps answering on every host, so the deploy check never follows a redirect.
export const config = { matcher: ["/((?!api/health|_next/).*)"] };
