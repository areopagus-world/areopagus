import { NextResponse } from "next/server";
import { eventId } from "@/chronology/rules";
import { removeEvent } from "@/chronology/store";
import { authEnabled, publicOrigin, sameOrigin } from "@/identity/config";
import { currentUser } from "@/identity/session";

/** Removes one of the signed-in person's own events. */
export async function POST(request: Request) {
  if (!authEnabled()) return new NextResponse(null, { status: 404 });
  if (!sameOrigin(request)) return new NextResponse(null, { status: 403 });
  const origin = publicOrigin(request);
  const user = await currentUser();
  if (!user) return NextResponse.redirect(new URL("/login", origin), 303);
  const id = eventId((await request.formData()).get("id"));
  if (id) await removeEvent(user.id, id);
  return NextResponse.redirect(new URL("/me#chronology", origin), 303);
}
