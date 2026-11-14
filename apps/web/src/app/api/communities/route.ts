import { NextResponse } from "next/server";
import { createCommunity } from "@/communities/store";
import { authEnabled, publicOrigin, sameOrigin } from "@/identity/config";
import { currentUser } from "@/identity/session";
import { findPlace, placeLabel } from "@/places/store";
import { checkHandle, cleanText } from "@/spaces/rules";

/** Starts a community from the form on /communities/new. */
export async function POST(request: Request) {
  if (!authEnabled()) return new NextResponse(null, { status: 404 });
  if (!sameOrigin(request)) return new NextResponse(null, { status: 403 });
  const origin = publicOrigin(request);
  const user = await currentUser();
  if (!user) return NextResponse.redirect(new URL("/login", origin), 303);

  const form = await request.formData();
  const back = (problem: string) =>
    NextResponse.redirect(new URL(`/communities/new?problem=${problem}`, origin), 303);
  const checked = checkHandle(form.get("handle"));
  if ("problem" in checked) return back(checked.problem);
  const name = cleanText(form.get("name"), 80);
  if (!name) return back("name");
  const pickedId = form.get("place_id");
  const picked = typeof pickedId === "string" && pickedId ? await findPlace(pickedId) : undefined;

  const result = await createCommunity(user.id, {
    handle: checked.handle,
    name,
    about: cleanText(form.get("about"), 1000, true),
    place: picked ? placeLabel(picked) : cleanText(form.get("place"), 80),
    placeId: picked?.id ?? null,
  });
  if (result !== "created") return back(result);
  return NextResponse.redirect(new URL(`/${checked.handle}`, origin), 303);
}
