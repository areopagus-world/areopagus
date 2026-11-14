import { eventId } from "@/chronology/rules";
import { checkHandle } from "@/spaces/rules";
import { findTarget, type Target, type TargetKind } from "./store";

/** Reads which thing is being reported from form fields or query parameters. */
export async function targetFrom(get: (name: string) => unknown): Promise<Target | undefined> {
  const event = eventId(get("event"));
  if (event) return findTarget("event", event);
  for (const kind of ["space", "community"] as TargetKind[]) {
    const checked = checkHandle(get(kind));
    if ("handle" in checked) return findTarget(kind, checked.handle);
  }
  return undefined;
}

/** The query string that names a target again, for links and redirects. */
export function targetQuery(target: Target): string {
  return target.kind === "event" ? `event=${target.id}` : `${target.kind}=${target.path.slice(1)}`;
}
