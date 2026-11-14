import { NextResponse } from "next/server";
import { authEnabled, publicOrigin, sameOrigin } from "@/identity/config";
import { optionsResponse } from "@/identity/passkey-http";
import { startAuthentication } from "@/identity/passkeys";

export async function POST(request: Request) {
  if (!authEnabled()) return new NextResponse(null, { status: 404 });
  if (!sameOrigin(request)) return new NextResponse(null, { status: 403 });
  const { options, secret } = await startAuthentication(publicOrigin(request));
  return optionsResponse(options, secret);
}
