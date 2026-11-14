import { NextResponse } from "next/server";
import { eventId } from "@/chronology/rules";
import { publicOrigin, sameOrigin } from "@/identity/config";
import { currentUser } from "@/identity/session";
import { isModerator } from "@/moderation/rules";
import { decide } from "@/moderation/store";
import { cleanText } from "@/spaces/rules";

const ACTIONS = ["keep", "hide", "restore"] as const;

/** A moderator's decision on a report. */
export async function POST(request: Request) {
  if (!sameOrigin(request)) return new NextResponse(null, { status: 403 });
  const user = await currentUser();
  if (!user || !isModerator(user.email, process.env.MODERATOR_EMAILS)) {
    return new NextResponse(null, { status: 404 });
  }
  const form = await request.formData();
  const id = eventId(form.get("id"));
  const action = ACTIONS.find((known) => known === form.get("action"));
  const note = cleanText(form.get("note"), 500, true);
  if (id && action && note) await decide(id, user.id, action, note);
  return NextResponse.redirect(new URL("/moderation", publicOrigin(request)), 303);
}
