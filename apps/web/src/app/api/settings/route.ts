import { NextResponse } from "next/server";
import { authEnabled, publicOrigin, sameOrigin } from "@/identity/config";
import { currentUser } from "@/identity/session";
import { setNotify } from "@/identity/settings";

/** Saves the e-mail settings from /me. */
export async function POST(request: Request) {
  if (!authEnabled()) return new NextResponse(null, { status: 404 });
  if (!sameOrigin(request)) return new NextResponse(null, { status: 403 });
  const origin = publicOrigin(request);
  const user = await currentUser();
  if (!user) return NextResponse.redirect(new URL("/login", origin), 303);
  // An unticked box sends nothing at all; a body that is not a form counts as unticked too.
  const form = await request.formData().catch(() => new FormData());
  await setNotify(user.id, form.get("notify") === "on");
  return NextResponse.redirect(new URL("/me?settings=1#settings", origin), 303);
}
