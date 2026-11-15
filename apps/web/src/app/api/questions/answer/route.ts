import { NextResponse } from "next/server";
import { eventId as uuid } from "@/chronology/rules";
import { authEnabled, publicOrigin, sameOrigin } from "@/identity/config";
import { currentUser } from "@/identity/session";
import { notify } from "@/questions/notify";
import { checkAnswer } from "@/questions/rules";
import { addAnswer, findQuestion } from "@/questions/store";

/** Answers a question from the form on its page. */
export async function POST(request: Request) {
  if (!authEnabled()) return new NextResponse(null, { status: 404 });
  if (!sameOrigin(request)) return new NextResponse(null, { status: 403 });
  const origin = publicOrigin(request);
  const user = await currentUser();
  if (!user) return NextResponse.redirect(new URL("/login", origin), 303);

  const form = await request.formData();
  const id = uuid(form.get("question"));
  if (!id) return new NextResponse(null, { status: 404 });
  const back = (query = "") =>
    NextResponse.redirect(new URL(`/questions/${id}${query}#answers`, origin), 303);
  const body = checkAnswer(form.get("body"));
  if (!body) return back("?problem=answer");
  const result = await addAnswer(user.id, id, body);
  if (result === "no-question") return new NextResponse(null, { status: 404 });
  if (result !== "added") return back(`?problem=${result}`);

  const question = await findQuestion(id);
  if (question && question.authorId !== user.id) {
    await notify(question.authorId, "An answer to your question on Areopagus", [
      question.title,
      "",
      `${origin}/questions/${id}#answers`,
    ]);
  }
  return back();
}
