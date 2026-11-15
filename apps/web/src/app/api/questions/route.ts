import { NextResponse } from "next/server";
import { authEnabled, publicOrigin, sameOrigin } from "@/identity/config";
import { currentUser } from "@/identity/session";
import { notify } from "@/questions/notify";
import { checkQuestion } from "@/questions/rules";
import { askQuestion, userOfSpace, type AskTarget } from "@/questions/store";
import { checkHandle } from "@/spaces/rules";

/** Asks a question from the form on /questions/new. */
export async function POST(request: Request) {
  if (!authEnabled()) return new NextResponse(null, { status: 404 });
  if (!sameOrigin(request)) return new NextResponse(null, { status: 403 });
  const origin = publicOrigin(request);
  const user = await currentUser();
  if (!user) return NextResponse.redirect(new URL("/login", origin), 303);

  const form = await request.formData();
  const to = checkHandle(form.get("to"));
  const placeId = form.get("place_id");
  const target: AskTarget =
    "handle" in to
      ? { toHandle: to.handle }
      : typeof placeId === "string" && /^\d{1,12}$/.test(placeId)
        ? { placeId }
        : {};
  const keep = new URLSearchParams();
  if ("toHandle" in target) keep.set("to", target.toHandle);
  if ("placeId" in target) keep.set("place_id", target.placeId);
  const back = (problem: string) => {
    keep.set("problem", problem);
    return NextResponse.redirect(new URL(`/questions/new?${keep}`, origin), 303);
  };

  const checked = checkQuestion({
    title: form.get("title"),
    body: form.get("body"),
    skill: form.get("skill"),
  });
  if ("problem" in checked) return back(checked.problem);
  const result = await askQuestion(user.id, checked, target);
  if (typeof result === "string") return back(result);

  if ("toHandle" in target) {
    const addressee = await userOfSpace(target.toHandle);
    if (addressee) {
      await notify(addressee, origin, (t) => ({
        subject: t.mail.questionSubject,
        lines: [checked.title, "", `${origin}/questions/${result.id}`],
      }));
    }
  }
  return NextResponse.redirect(new URL(`/questions/${result.id}`, origin), 303);
}
