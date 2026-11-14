import { NextResponse } from "next/server";
import { communityAction } from "@/communities/http";
import { joinCommunity, roleIn } from "@/communities/store";

export async function POST(request: Request) {
  const ready = await communityAction(request);
  if (ready instanceof NextResponse) return ready;
  await joinCommunity(ready.user.id, ready.community.id);
  // Without a space nothing was added: say so instead of failing silently.
  return ready.back((await roleIn(ready.user.id, ready.community.id)) ? "" : "problem=space");
}
