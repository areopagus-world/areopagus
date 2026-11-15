import { NextResponse } from "next/server";
import { checkEvent } from "@/chronology/rules";
import { communityAction } from "@/communities/http";
import { addCommunityEvent } from "@/communities/store";

/** A member adds an event to the community's chronology. */
export async function POST(request: Request) {
  const ready = await communityAction(request);
  if (ready instanceof NextResponse) return ready;
  const { form } = ready;
  const checked = checkEvent({
    day: form.get("day"),
    title: form.get("title"),
    body: form.get("body"),
    onlyMe: null,
    level: form.get("level"),
  });
  if ("problem" in checked) return ready.back(`problem=${checked.problem}`);
  const result = await addCommunityEvent(ready.user.id, ready.community, checked);
  return ready.back(result === "added" ? "" : `problem=${result}`);
}
