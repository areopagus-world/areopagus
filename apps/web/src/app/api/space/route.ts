import { NextResponse } from "next/server";
import { authEnabled, publicOrigin, sameOrigin } from "@/identity/config";
import { currentUser } from "@/identity/session";
import { checkHandle, cleanText, parseSkills } from "@/spaces/rules";
import { saveSpace } from "@/spaces/store";

/** Saves the signed-in person's space from the form on /me. */
export async function POST(request: Request) {
  if (!authEnabled()) return new NextResponse(null, { status: 404 });
  if (!sameOrigin(request)) return new NextResponse(null, { status: 403 });
  const origin = publicOrigin(request);
  const user = await currentUser();
  if (!user) return NextResponse.redirect(new URL("/login", origin), 303);

  const form = await request.formData();
  const back = (problem: string) =>
    NextResponse.redirect(new URL(`/me?problem=${problem}`, origin), 303);
  const checked = checkHandle(form.get("handle"));
  if ("problem" in checked) return back(checked.problem);
  const name = cleanText(form.get("name"), 80);
  if (!name) return back("name");

  const result = await saveSpace(user.id, {
    handle: checked.handle,
    name,
    about: cleanText(form.get("about"), 1000, true),
    place: cleanText(form.get("place"), 80),
    skills: parseSkills(form.get("skills")),
  });
  if (result === "taken") return back("taken");
  return NextResponse.redirect(new URL("/me?saved=1", origin), 303);
}
