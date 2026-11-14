/** Sign-in ships switched off. AUTH_ENABLED=true turns it on; AUTH_ALLOWED_EMAILS limits it to a first circle. */
export function authEnabled(env: NodeJS.ProcessEnv = process.env): boolean {
  return env.AUTH_ENABLED === "true";
}

export const SESSION_COOKIE = process.env.NODE_ENV === "production" ? "__Host-session" : "session";

/** Public origin of the app, e.g. https://beta.areopagus.world. Falls back to what the proxy reports. */
export function publicOrigin(request: Request): string {
  if (process.env.APP_ORIGIN) return process.env.APP_ORIGIN;
  const host =
    request.headers.get("x-forwarded-host") ?? request.headers.get("host") ?? "localhost";
  const proto = request.headers.get("x-forwarded-proto") ?? "http";
  return `${proto}://${host}`;
}

/** A state-changing request must come from our own pages. */
export function sameOrigin(request: Request): boolean {
  const origin = request.headers.get("origin");
  if (!origin) return false;
  try {
    return new URL(origin).origin === new URL(publicOrigin(request)).origin;
  } catch {
    return false;
  }
}

export function clientIp(request: Request): string {
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
}
