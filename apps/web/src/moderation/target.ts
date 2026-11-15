import { eventId } from "@/chronology/rules";
import { checkHandle } from "@/spaces/rules";
import { findTarget, type Target, type TargetKind } from "./store";

/** Kinds named by id rather than by address. */
export const BY_ID: TargetKind[] = ["event", "question", "answer"];

/** Reads which thing is being reported from form fields or query parameters. */
export async function targetFrom(get: (name: string) => unknown): Promise<Target | undefined> {
  for (const kind of BY_ID) {
    const id = eventId(get(kind));
    if (id) return findTarget(kind, id);
  }
  for (const kind of ["space", "community"] as TargetKind[]) {
    const checked = checkHandle(get(kind));
    if ("handle" in checked) return findTarget(kind, checked.handle);
  }
  return undefined;
}

/** The query string that names a target again, for links and redirects. */
export function targetQuery(target: Target): string {
  return `${target.kind}=${targetKey(target)}`;
}

/** The value that names a target in a form: its id, or its address for spaces and communities. */
export function targetKey(target: Target): string {
  return BY_ID.includes(target.kind) ? target.id : target.path.slice(1);
}
