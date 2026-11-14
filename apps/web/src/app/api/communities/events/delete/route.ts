import { NextResponse } from "next/server";
import { eventId } from "@/chronology/rules";
import { communityAction } from "@/communities/http";
import { removeCommunityEvent } from "@/communities/store";

export async function POST(request: Request) {
  const ready = await communityAction(request);
  if (ready instanceof NextResponse) return ready;
  const id = eventId(ready.form.get("id"));
  if (id) await removeCommunityEvent(ready.user.id, ready.community.id, id);
  return ready.back();
}
