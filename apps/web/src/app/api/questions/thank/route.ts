import { NextResponse } from "next/server";
import { eventId as uuid } from "@/chronology/rules";
import { authEnabled, publicOrigin, sameOrigin } from "@/identity/config";
import { currentUser } from "@/identity/session";
import { toggleThanks } from "@/questions/store";

/** The asker thanks an answer, or takes the thanks back. */
export async function POST(request: Request) {
  if (!authEnabled()) return new NextResponse(null, { status: 404 });
  if (!sameOrigin(request)) return new NextResponse(null, { status: 403 });
  const origin = publicOrigin(request);
  const user = await currentUser();
  if (!user) return NextResponse.redirect(new URL("/login", origin), 303);
  const answer = uuid((await request.formData()).get("answer"));
  const questionId = answer ? await toggleThanks(user.id, answer) : undefined;
  if (!questionId) return new NextResponse(null, { status: 404 });
  return NextResponse.redirect(new URL(`/questions/${questionId}#a-${answer}`, origin), 303);
}
