import { NextResponse } from "next/server";
import { authEnabled, publicOrigin, sameOrigin, SESSION_COOKIE } from "@/identity/config";
import { redeemLoginToken } from "@/identity/store";
import { SESSION_DAYS } from "@/identity/tokens";

export async function POST(request: Request) {
  if (!authEnabled()) return new NextResponse(null, { status: 404 });
  if (!sameOrigin(request)) return new NextResponse(null, { status: 403 });
  const origin = publicOrigin(request);
  const token = (await request.formData()).get("token");
  const session = typeof token === "string" ? await redeemLoginToken(token) : undefined;
  if (!session) return NextResponse.redirect(new URL("/auth/verify?failed=1", origin), 303);

  const response = NextResponse.redirect(new URL("/me", origin), 303);
  response.cookies.set(SESSION_COOKIE, session, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_DAYS * 24 * 60 * 60,
  });
  return response;
}
