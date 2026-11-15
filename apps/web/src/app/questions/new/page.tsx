import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { authEnabled } from "@/identity/config";
import { currentUser } from "@/identity/session";
import { getT } from "@/i18n/server";
import { findPlace, placeLabel } from "@/places/store";
import { BODY_MAX, MAX_QUESTIONS_PER_DAY, SKILL_MAX, TITLE_MAX } from "@/questions/rules";
import { checkHandle } from "@/spaces/rules";
import { findSpaceByHandle } from "@/spaces/store";
import { PlaceField } from "../../me/place-field";
import { button, field, Screen } from "../../ui";

export const dynamic = "force-dynamic";
export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getT();
  return { title: `${t.questions.ask} · ${t.brand}`, robots: { index: false } };
}

const hint = { color: "#a39b8f", fontSize: 15, margin: "-8px 0 16px" } as const;

/** Ask a person (?to=handle), the people of a place (?place_id=) or everyone. */
export default async function Ask({
  searchParams,
}: {
  searchParams: Promise<{ to?: string; place_id?: string; problem?: string }>;
}) {
  if (!authEnabled()) notFound();
  if (!(await currentUser())) redirect("/login");
  const [params, { t }] = await Promise.all([searchParams, getT()]);
  const problems: Record<string, string> = {
    title: t.questions.problemTitle,
    skill: t.questions.problemSkill,
    "no-space": t.questions.problemNoSpace,
    limit: t.questions.problemLimit(MAX_QUESTIONS_PER_DAY),
    "no-target": t.questions.problemNoTarget,
    self: t.questions.problemSelf,
  };
  const checked = checkHandle(params.to);
  const to = "handle" in checked ? await findSpaceByHandle(checked.handle) : undefined;
  const place = !to && params.place_id ? await findPlace(params.place_id) : undefined;
  return (
    <Screen
      title={
        to
          ? t.questions.askPerson(to.name)
          : place
            ? t.questions.askPlace(place.name)
            : t.questions.ask
      }
    >
      {params.problem && problems[params.problem] ? (
        <p style={{ color: "#ff4a1c" }}>{problems[params.problem]}</p>
      ) : null}
      <p style={{ ...hint, margin: "0 0 22px" }}>
        {to
          ? t.questions.notePerson(to.name)
          : place
            ? t.questions.notePlace(place.name)
            : t.questions.noteEveryone}
      </p>
      <form method="post" action="/api/questions">
        {to ? <input type="hidden" name="to" value={to.handle} /> : null}
        <label>
          {t.questions.question}
          <input style={field} name="title" maxLength={TITLE_MAX} minLength={5} required />
        </label>
        <label>
          {t.questions.details}
          <textarea style={{ ...field, minHeight: 130 }} name="body" maxLength={BODY_MAX} />
        </label>
        {to ? null : (
          <>
            <label>
              {t.questions.where}
              <PlaceField
                initialLabel={place ? placeLabel(place) : ""}
                initialId={place?.id ?? ""}
              />
            </label>
            <p style={hint}>{t.questions.whereHint}</p>
          </>
        )}
        <label>
          {t.questions.skill}
          <input
            style={field}
            name="skill"
            maxLength={SKILL_MAX}
            placeholder={t.questions.skillPlaceholder}
          />
        </label>
        <button style={button} type="submit">
          {t.questions.submit}
        </button>
      </form>
    </Screen>
  );
}
