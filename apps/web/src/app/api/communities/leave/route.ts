import { NextResponse } from "next/server";
import { communityAction } from "@/communities/http";
import { leaveCommunity } from "@/communities/store";

export async function POST(request: Request) {
  const ready = await communityAction(request);
  if (ready instanceof NextResponse) return ready;
  await leaveCommunity(ready.user.id, ready.community.id);
  return ready.back();
}
