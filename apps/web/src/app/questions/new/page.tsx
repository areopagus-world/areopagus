import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { authEnabled } from "@/identity/config";
import { currentUser } from "@/identity/session";
import { findPlace, placeLabel } from "@/places/store";
import { BODY_MAX, MAX_QUESTIONS_PER_DAY, SKILL_MAX, TITLE_MAX } from "@/questions/rules";
import { checkHandle } from "@/spaces/rules";
import { findSpaceByHandle } from "@/spaces/store";
import { PlaceField } from "../../me/place-field";
import { button, field, Screen } from "../../ui";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Ask a question · Areopagus", robots: { index: false } };

const PROBLEMS: Record<string, string> = {
  title: "Write the question itself in at least a few words.",
  skill: "Name one skill, without commas, up to 40 characters.",
  "no-space": "Create your space first: questions are shown with its name.",
  limit: `You can ask up to ${MAX_QUESTIONS_PER_DAY} questions a day.`,
  "no-target": "That person or place was not found.",
  self: "That is your own space: ask someone else, or everyone.",
};
const hint = { color: "#a39b8f", fontSize: 15, margin: "-8px 0 16px" } as const;

/** Ask a person (?to=handle), the people of a place (?place_id=) or everyone. */
export default async function Ask({
  searchParams,
}: {
  searchParams: Promise<{ to?: string; place_id?: string; problem?: string }>;
}) {
  if (!authEnabled()) notFound();
  if (!(await currentUser())) redirect("/login");
  const params = await searchParams;
  const checked = checkHandle(params.to);
  const to = "handle" in checked ? await findSpaceByHandle(checked.handle) : undefined;
  const place = !to && params.place_id ? await findPlace(params.place_id) : undefined;
  return (
    <Screen title={to ? `Ask ${to.name}` : place ? `Ask ${place.name}` : "Ask a question"}>
      {params.problem && PROBLEMS[params.problem] ? (
        <p style={{ color: "#ff4a1c" }}>{PROBLEMS[params.problem]}</p>
      ) : null}
      <p style={{ ...hint, margin: "0 0 22px" }}>
        {to
          ? `${to.name} gets an e-mail about it. The question and the answers are public.`
          : place
            ? `Everyone who looks at ${place.name} sees it. The question and the answers are public.`
            : "The question and the answers are public."}
      </p>
      <form method="post" action="/api/questions">
        {to ? <input type="hidden" name="to" value={to.handle} /> : null}
        <label>
          Question
          <input style={field} name="title" maxLength={TITLE_MAX} minLength={5} required />
        </label>
        <label>
          Details
          <textarea style={{ ...field, minHeight: 130 }} name="body" maxLength={BODY_MAX} />
        </label>
        {to ? null : (
          <>
            <label>
              Where
              <PlaceField
                initialLabel={place ? placeLabel(place) : ""}
                initialId={place?.id ?? ""}
              />
            </label>
            <p style={hint}>Pick a town to ask the people there, or leave empty to ask everyone.</p>
          </>
        )}
        <label>
          Skill it needs
          <input
            style={field}
            name="skill"
            maxLength={SKILL_MAX}
            placeholder="optional, for example bike repair"
          />
        </label>
        <button style={button} type="submit">
          Ask
        </button>
      </form>
    </Screen>
  );
}
