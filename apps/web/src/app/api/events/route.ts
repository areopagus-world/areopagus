import { NextResponse } from "next/server";
import { checkEvent, eventId } from "@/chronology/rules";
import { addEvent } from "@/chronology/store";
import { authEnabled, publicOrigin, sameOrigin } from "@/identity/config";
import { currentUser } from "@/identity/session";

/** Adds an event to the signed-in person's chronology from the form on /me. */
export async function POST(request: Request) {
  if (!authEnabled()) return new NextResponse(null, { status: 404 });
  if (!sameOrigin(request)) return new NextResponse(null, { status: 403 });
  const origin = publicOrigin(request);
  const user = await currentUser();
  if (!user) return NextResponse.redirect(new URL("/login", origin), 303);

  const form = await request.formData();
  const back = (query: string) =>
    NextResponse.redirect(new URL(`/me?${query}#chronology`, origin), 303);
  const checked = checkEvent({
    day: form.get("day"),
    title: form.get("title"),
    body: form.get("body"),
    onlyMe: form.get("only_me"),
  });
  if ("problem" in checked) return back(`problem=${checked.problem}`);
  const result = await addEvent(user.id, checked, eventId(form.get("continues")));
  if (result === "no-space") return back("problem=event-space");
  if (result === "full") return back("problem=event-full");
  return back("added=1");
}
