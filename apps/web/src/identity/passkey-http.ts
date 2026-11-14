import { NextResponse } from "next/server";
import { CHALLENGE_COOKIE, CHALLENGE_MINUTES } from "./passkeys";

/** Answers with the ceremony options and remembers, in a cookie, which challenge they belong to. */
export function optionsResponse(options: unknown, secret: string): NextResponse {
  const response = NextResponse.json(options, { headers: { "cache-control": "no-store" } });
  response.cookies.set(CHALLENGE_COOKIE, secret, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: CHALLENGE_MINUTES * 60,
  });
  return response;
}

export async function readJson(request: Request): Promise<unknown> {
  try {
    return await request.json();
  } catch {
    return undefined;
  }
}
