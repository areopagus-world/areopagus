import type { AuthenticationResponseJSON } from "@simplewebauthn/server";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { authEnabled, publicOrigin, sameOrigin, SESSION_COOKIE } from "@/identity/config";
import { readJson } from "@/identity/passkey-http";
import { CHALLENGE_COOKIE, finishAuthentication } from "@/identity/passkeys";
import { SESSION_DAYS } from "@/identity/tokens";

export async function POST(request: Request) {
  if (!authEnabled()) return new NextResponse(null, { status: 404 });
  if (!sameOrigin(request)) return new NextResponse(null, { status: 403 });
  const secret = (await cookies()).get(CHALLENGE_COOKIE)?.value;
  const body = await readJson(request);
  const session =
    secret && body
      ? await finishAuthentication(
          secret,
          body as AuthenticationResponseJSON,
          publicOrigin(request),
        )
      : undefined;
  const response = NextResponse.json({ ok: Boolean(session) }, { status: session ? 200 : 400 });
  response.cookies.delete(CHALLENGE_COOKIE);
  if (session) {
    response.cookies.set(SESSION_COOKIE, session, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: SESSION_DAYS * 24 * 60 * 60,
    });
  }
  return response;
}
