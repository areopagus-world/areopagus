import { notFound, redirect } from "next/navigation";
import { BODY_MAX, TITLE_MAX } from "@/chronology/rules";
import { ownTimeline } from "@/chronology/store";
import { authEnabled } from "@/identity/config";
import { countPasskeys } from "@/identity/passkeys";
import { currentUser } from "@/identity/session";
import { recipient, rememberLocale } from "@/identity/settings";
import { getT } from "@/i18n/server";
import { checkLevel, LEVELS } from "@/snapshots/rules";
import { levelTitle, SPIRAL_TITLE_MAX } from "@/spiral/rules";
import { spiralOf } from "@/spiral/store";
import { HANDLE_FIELD_PATTERN, MAX_SKILLS } from "@/spaces/rules";
import { findSpaceByUser } from "@/spaces/store";
import { LevelSelect } from "../level-select";
import { SpiralView } from "../spiral";
import { PasskeyAdd } from "../passkey-buttons";
import { sectionTitle, Timeline } from "../timeline";
import { button, field, Screen } from "../ui";
import { PlaceField } from "./place-field";

export const dynamic = "force-dynamic";

const hint = { color: "#a39b8f", fontSize: 15, margin: "-8px 0 16px" } as const;
const plain = {
  background: "none",
  border: 0,
  padding: 0,
  color: "#a39b8f",
  font: "inherit",
  fontSize: 15,
  textDecoration: "underline",
  cursor: "pointer",
} as const;

export default async function Me({
  searchParams,
}: {
  searchParams: Promise<{
    problem?: string;
    saved?: string;
    added?: string;
    settings?: string;
    level?: string;
    spiral?: string;
  }>;
}) {
  if (!authEnabled()) notFound();
  const user = await currentUser();
  if (!user) redirect("/login");
  const [space, query, passkeys, events, me, spiral, { locale, t }] = await Promise.all([
    findSpaceByUser(user.id),
    searchParams,
    countPasskeys(user.id),
    ownTimeline(user.id),
    recipient(user.id),
    spiralOf({ userId: user.id }, "owner"),
    getT(),
  ]);
  const { problem, saved, added, settings } = query;
  // A level picked in the spiral narrows the chronology and is the level of the next entry.
  const level = checkLevel(query.level);
  const shown = level ? events.filter((event) => event.level === level) : events;
  // E-mails to this person go out in the language they read the network in.
  await rememberLocale(user.id, locale);
  const problems: Record<string, string> = {
    format: t.common.problemFormat,
    reserved: t.common.problemReserved,
    taken: t.me.problemTaken,
    name: t.common.problemName,
    "event-date": t.common.problemDay,
    "event-title": t.common.problemEventTitle,
    "event-space": t.me.problemEventSpace,
    "event-full": t.me.problemEventFull,
  };
  const today = new Date().toISOString().slice(0, 10);
  return (
    <Screen title={space ? t.me.titleHave : t.me.titleMake}>
      {problem && problems[problem] ? (
        <p style={{ color: "#ff4a1c" }}>{problems[problem]}</p>
      ) : null}
      {space?.hiddenNote != null ? (
        <p style={{ color: "#ff4a1c" }}>
          {t.me.hidden(space.hiddenNote)} <a href="/legal">{t.me.legalNotice}</a>.
        </p>
      ) : null}
      {saved && space ? (
        <p>
          {t.me.saved}{" "}
          <a
            href={`/${space.handle}`}
            style={{ color: "#ff4a1c" }}
          >{`areopagus.world/${space.handle}`}</a>
        </p>
      ) : null}
      <form method="post" action="/api/space">
        <label>
          {t.common.address}
          <input
            style={field}
            name="handle"
            defaultValue={space?.handle ?? ""}
            pattern={HANDLE_FIELD_PATTERN}
            title={t.me.addressTitle}
            minLength={3}
            maxLength={30}
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
            required
          />
        </label>
        <p style={hint}>{t.me.addressHint}</p>
        <label>
          {t.common.name}
          <input
            style={field}
            name="name"
            defaultValue={space?.name ?? ""}
            maxLength={80}
            required
          />
        </label>
        <label>
          {t.common.place}
          <PlaceField initialLabel={space?.place ?? ""} initialId={space?.placeId ?? ""} />
        </label>
        <p style={hint}>{t.me.placeHint}</p>
        <label>
          {t.me.skills}
          <textarea
            style={{ ...field, minHeight: 90 }}
            name="skills"
            defaultValue={space?.skills.join(", ") ?? ""}
          />
        </label>
        <p style={hint}>{t.me.skillsHint(MAX_SKILLS)}</p>
        <label>
          {t.me.about}
          <textarea
            style={{ ...field, minHeight: 150 }}
            name="about"
            defaultValue={space?.about ?? ""}
            maxLength={1000}
          />
        </label>
        <button style={button} type="submit">
          {space ? t.me.save : t.me.create}
        </button>
      </form>
      {space && spiral ? (
        <section id="spiral">
          <h2 style={sectionTitle}>{t.spiral.ownTitle}</h2>
          <p style={hint}>{t.spiral.ownLead}</p>
          {query.spiral === "saved" ? <p>{t.spiral.saved}</p> : null}
          <SpiralView
            spiral={spiral}
            t={t}
            current={level}
            href={(pick) => (pick ? `/me?level=${pick}#chronology` : "/me#chronology")}
          />
          <details style={{ margin: "22px 0 0" }}>
            <summary style={{ cursor: "pointer" }}>{t.spiral.settings}</summary>
            <form method="post" action="/api/spiral" style={{ margin: "18px 0 0" }}>
              <label style={{ display: "flex", alignItems: "center", gap: 10, margin: "0 0 22px" }}>
                <input type="checkbox" name="public" defaultChecked={spiral.public} />{" "}
                {t.spiral.show}
              </label>
              {LEVELS.map((each) => {
                const name = t.snapshots.levels[each - 1]?.name ?? "";
                const own = spiral.levels.find((item) => item.level === each)?.title ?? "";
                return (
                  <label key={each}>
                    {t.spiral.titleLabel(each, name)}
                    <input
                      style={field}
                      name={`title_${each}`}
                      defaultValue={own}
                      placeholder={name}
                      maxLength={SPIRAL_TITLE_MAX}
                    />
                  </label>
                );
              })}
              <button style={button} type="submit">
                {t.spiral.save}
              </button>
            </form>
          </details>
        </section>
      ) : null}
      {space ? (
        <section id="chronology">
          <h2 style={sectionTitle}>{t.me.chronology}</h2>
          <p style={hint}>{t.me.chronologyHint}</p>
          {added ? <p>{t.me.added}</p> : null}
          <form method="post" action="/api/events" style={{ margin: "22px 0 44px" }}>
            <label>
              {t.common.day}
              <input style={field} type="date" name="day" defaultValue={today} required />
            </label>
            <label>
              {t.common.whatHappened}
              <input style={field} name="title" maxLength={TITLE_MAX} required />
            </label>
            <label>
              {t.common.details}
              <textarea style={{ ...field, minHeight: 110 }} name="body" maxLength={BODY_MAX} />
            </label>
            <LevelSelect t={t} selected={level} />
            {events.length > 0 ? (
              <label>
                {t.me.continues}
                <select style={field} name="continues" defaultValue="">
                  <option value="">{t.me.standsAlone}</option>
                  {events.slice(0, 50).map((event) => (
                    <option key={event.id} value={event.id}>
                      {event.happenedOn} · {event.title}
                    </option>
                  ))}
                </select>
              </label>
            ) : null}
            <label style={{ display: "flex", alignItems: "center", gap: 10, margin: "0 0 22px" }}>
              <input type="checkbox" name="only_me" /> {t.me.onlyMe}
            </label>
            <button style={button} type="submit">
              {t.me.addEvent}
            </button>
          </form>
          {level ? (
            <p style={hint}>
              {t.spiral.filtered(levelTitle(spiral?.levels, level, t.snapshots.levels))}{" "}
              <a href="/me#chronology">{t.spiral.all}</a>
            </p>
          ) : null}
          <Timeline
            events={shown}
            action={(event) => (
              <form method="post" action="/api/events/delete" style={{ margin: "10px 0 0" }}>
                <input type="hidden" name="id" value={event.id} />
                <button type="submit" style={plain}>
                  {t.common.remove}
                </button>
              </form>
            )}
          />
        </section>
      ) : null}
      {space ? (
        <p style={{ margin: "44px 0 0" }}>
          <a href="/communities/new">{t.me.startCommunity}</a>
        </p>
      ) : null}
      <PasskeyAdd count={passkeys} text={t.passkey} />
      <section id="settings">
        <h2 style={{ fontSize: 22, margin: "44px 0 10px" }}>{t.me.emails}</h2>
        {settings ? <p>{t.me.settingsSaved}</p> : null}
        <form method="post" action="/api/settings">
          <label style={{ display: "flex", alignItems: "flex-start", gap: 10, margin: "0 0 18px" }}>
            <input
              type="checkbox"
              name="notify"
              defaultChecked={me?.notify ?? true}
              style={{ marginTop: 6 }}
            />
            {t.me.notify}
          </label>
          <button style={{ ...button, background: "transparent", color: "#f3efe6" }} type="submit">
            {t.me.saveSettings}
          </button>
        </form>
      </section>
      <p style={{ ...hint, margin: "34px 0 10px" }}>{t.me.signedInAs(user.email)}</p>
      <form method="post" action="/api/auth/logout">
        <button style={{ ...button, background: "transparent", color: "#f3efe6" }} type="submit">
          {t.me.signOut}
        </button>
      </form>
    </Screen>
  );
}
