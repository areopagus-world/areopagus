import type { RegistrationResponseJSON } from "@simplewebauthn/server";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { authEnabled, publicOrigin, sameOrigin } from "@/identity/config";
import { readJson } from "@/identity/passkey-http";
import { CHALLENGE_COOKIE, finishRegistration } from "@/identity/passkeys";
import { currentUser } from "@/identity/session";

export async function POST(request: Request) {
  if (!authEnabled()) return new NextResponse(null, { status: 404 });
  if (!sameOrigin(request)) return new NextResponse(null, { status: 403 });
  const user = await currentUser();
  if (!user) return new NextResponse(null, { status: 401 });
  const secret = (await cookies()).get(CHALLENGE_COOKIE)?.value;
  const body = await readJson(request);
  const ok =
    secret && body
      ? await finishRegistration(
          user,
          secret,
          body as RegistrationResponseJSON,
          publicOrigin(request),
        )
      : false;
  const response = NextResponse.json({ ok }, { status: ok ? 200 : 400 });
  response.cookies.delete(CHALLENGE_COOKIE);
  return response;
}
