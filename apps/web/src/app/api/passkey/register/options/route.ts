import { NextResponse } from "next/server";
import { authEnabled, publicOrigin, sameOrigin } from "@/identity/config";
import { optionsResponse } from "@/identity/passkey-http";
import { countPasskeys, MAX_PASSKEYS, startRegistration } from "@/identity/passkeys";
import { currentUser } from "@/identity/session";

export async function POST(request: Request) {
  if (!authEnabled()) return new NextResponse(null, { status: 404 });
  if (!sameOrigin(request)) return new NextResponse(null, { status: 403 });
  const user = await currentUser();
  if (!user) return new NextResponse(null, { status: 401 });
  if ((await countPasskeys(user.id)) >= MAX_PASSKEYS)
    return new NextResponse(null, { status: 409 });
  const { options, secret } = await startRegistration(user, publicOrigin(request));
  return optionsResponse(options, secret);
}
