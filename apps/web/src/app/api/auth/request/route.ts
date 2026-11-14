import { NextResponse } from "next/server";
import { authEnabled, clientIp, publicOrigin, sameOrigin } from "@/identity/config";
import { sendLoginLink } from "@/identity/mail";
import { createLoginToken } from "@/identity/store";
import { isAllowed, normalizeEmail } from "@/identity/tokens";

/**
 * Asks for a sign-in link. The answer is the same whatever happens, so it never reveals
 * whether an address is known, allowed or rate-limited.
 */
export async function POST(request: Request) {
  if (!authEnabled()) return new NextResponse(null, { status: 404 });
  if (!sameOrigin(request)) return new NextResponse(null, { status: 403 });
  const origin = publicOrigin(request);
  const email = normalizeEmail((await request.formData()).get("email"));
  if (email && isAllowed(email, process.env.AUTH_ALLOWED_EMAILS)) {
    try {
      const secret = await createLoginToken(email, clientIp(request));
      if (secret) await sendLoginLink(email, `${origin}/auth/verify?token=${secret}`);
    } catch (error) {
      console.error("sign-in link could not be sent", error);
    }
  }
  return NextResponse.redirect(new URL("/login/sent", origin), 303);
}
