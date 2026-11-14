import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { publicOrigin, sameOrigin, SESSION_COOKIE } from "@/identity/config";
import { endSession } from "@/identity/store";

export async function POST(request: Request) {
  if (!sameOrigin(request)) return new NextResponse(null, { status: 403 });
  const secret = (await cookies()).get(SESSION_COOKIE)?.value;
  if (secret) await endSession(secret);
  const response = NextResponse.redirect(new URL("/", publicOrigin(request)), 303);
  response.cookies.delete(SESSION_COOKIE);
  return response;
}
