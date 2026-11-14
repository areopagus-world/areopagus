import { NextResponse } from "next/server";
import { authEnabled, publicOrigin, sameOrigin } from "@/identity/config";
import { currentUser } from "@/identity/session";
import type { User } from "@/identity/store";
import { checkHandle } from "@/spaces/rules";
import { findCommunity, type Community } from "./store";

type Ready = {
  user: User;
  community: Community;
  form: FormData;
  back: (query?: string) => NextResponse;
};

/**
 * Common start of every action on a community page: the checks, the signed-in person,
 * the community named in the form, and a way back to its page.
 */
export async function communityAction(request: Request): Promise<NextResponse | Ready> {
  if (!authEnabled()) return new NextResponse(null, { status: 404 });
  if (!sameOrigin(request)) return new NextResponse(null, { status: 403 });
  const origin = publicOrigin(request);
  const user = await currentUser();
  if (!user) return NextResponse.redirect(new URL("/login", origin), 303);
  const form = await request.formData();
  const checked = checkHandle(form.get("community"));
  const community = "handle" in checked ? await findCommunity(checked.handle) : undefined;
  if (!community) return new NextResponse(null, { status: 404 });
  const back = (query = "") =>
    NextResponse.redirect(new URL(`/${community.handle}${query ? `?${query}` : ""}`, origin), 303);
  return { user, community, form, back };
}
