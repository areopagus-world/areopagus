import { NextResponse } from "next/server";
import { authEnabled, publicOrigin, sameOrigin } from "@/identity/config";
import { currentUser } from "@/identity/session";
import { checkLevel, checkValue } from "@/snapshots/rules";
import { saveSnapshot } from "@/snapshots/store";

/** Records a snapshot of one level of a place, from the slider on the place's page. */
export async function POST(request: Request) {
  if (!authEnabled()) return new NextResponse(null, { status: 404 });
  if (!sameOrigin(request)) return new NextResponse(null, { status: 403 });
  const origin = publicOrigin(request);
  const user = await currentUser();
  if (!user) return NextResponse.redirect(new URL("/login", origin), 303);

  const form = await request.formData();
  const placeId = form.get("place_id");
  if (typeof placeId !== "string" || !/^\d{1,12}$/.test(placeId)) {
    return NextResponse.redirect(new URL("/map", origin), 303);
  }
  const level = checkLevel(form.get("level"));
  const value = checkValue(form.get("value"));
  const back = (query: string, anchor: string) =>
    NextResponse.redirect(new URL(`/places/${placeId}?${query}#${anchor}`, origin), 303);
  if (!level || value === undefined) return back("problem=value", "snapshots");

  const result = await saveSnapshot(user.id, placeId, level, value);
  if (result !== "saved") return back(`problem=${result}`, "snapshots");
  return back(`saved=${level}`, `level-${level}`);
}
