import { NextResponse } from "next/server";
import { authEnabled, publicOrigin, sameOrigin } from "@/identity/config";
import { currentUser } from "@/identity/session";
import { checkSpiral } from "@/spiral/rules";
import { saveSpiral } from "@/spiral/store";

/** Saves the owner's spiral from the form on /me: their names for the levels, and who sees it. */
export async function POST(request: Request) {
  if (!authEnabled()) return new NextResponse(null, { status: 404 });
  if (!sameOrigin(request)) return new NextResponse(null, { status: 403 });
  const origin = publicOrigin(request);
  const user = await currentUser();
  if (!user) return NextResponse.redirect(new URL("/login", origin), 303);

  const result = await saveSpiral(user.id, checkSpiral(await request.formData()));
  const where = result === "saved" ? "/me?spiral=saved#spiral" : "/me?problem=event-space";
  return NextResponse.redirect(new URL(where, origin), 303);
}
