import { notFound, redirect } from "next/navigation";
import { authEnabled } from "@/identity/config";
import { BODY_MAX, TITLE_MAX } from "@/chronology/rules";
import { ownTimeline } from "@/chronology/store";
import { countPasskeys } from "@/identity/passkeys";
import { currentUser } from "@/identity/session";
import { HANDLE_FIELD_PATTERN, MAX_SKILLS } from "@/spaces/rules";
import { findSpaceByUser } from "@/spaces/store";
import { PasskeyAdd } from "../passkey-buttons";
import { button, field, Screen } from "../ui";
import { sectionTitle, Timeline } from "../timeline";
import { PlaceField } from "./place-field";

export const dynamic = "force-dynamic";

const PROBLEMS: Record<string, string> = {
  format: "The address needs 3 to 30 characters: Latin letters, digits and hyphens.",
  reserved: "That address is kept for the network itself. Choose another one.",
  taken: "Someone already has that address. Choose another one.",
  name: "Enter the name people should see.",
  "event-date": "Choose a real day, not before 1900 and not more than a year ahead.",
  "event-title": "Say in a few words what happened.",
  "event-space": "Create your space first, then add to its chronology.",
  "event-full": "The chronology is full. Remove an entry to add a new one.",
};

const hint = { color: "#a39b8f", fontSize: 15, margin: "-8px 0 16px" } as const;

export default async function Me({
  searchParams,
}: {
  searchParams: Promise<{ problem?: string; saved?: string; added?: string }>;
}) {
  if (!authEnabled()) notFound();
  const user = await currentUser();
  if (!user) redirect("/login");
  const [space, { problem, saved, added }, passkeys, events] = await Promise.all([
    findSpaceByUser(user.id),
    searchParams,
    countPasskeys(user.id),
    ownTimeline(user.id),
  ]);
  const today = new Date().toISOString().slice(0, 10);

  return (
    <Screen title={space ? "Your space" : "Make your space"}>
      {problem && PROBLEMS[problem] ? (
        <p style={{ color: "#ff4a1c" }}>{PROBLEMS[problem]}</p>
      ) : null}
      {saved && space ? (
        <p>
          Saved. Your page:{" "}
          <a
            href={`/${space.handle}`}
            style={{ color: "#ff4a1c" }}
          >{`areopagus.world/${space.handle}`}</a>
        </p>
      ) : null}
      <form method="post" action="/api/space">
        <label>
          Address
          <input
            style={field}
            name="handle"
            defaultValue={space?.handle ?? ""}
            pattern={HANDLE_FIELD_PATTERN}
            title="3 to 30 characters: Latin letters, digits and hyphens. Not an e-mail address."
            minLength={3}
            maxLength={30}
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
            required
          />
        </label>
        <p style={hint}>
          areopagus.world/your-address, for example areopagus.world/pavel. Latin letters, digits and
          hyphens, 3 to 30 characters.
        </p>
        <label>
          Name
          <input
            style={field}
            name="name"
            defaultValue={space?.name ?? ""}
            maxLength={80}
            required
          />
        </label>
        <label>
          Place
          <PlaceField initialLabel={space?.place ?? ""} initialId={space?.placeId ?? ""} />
        </label>
        <p style={hint}>
          Start typing your town or village and pick it from the list: it lights up on the map.
        </p>
        <label>
          Skills
          <textarea
            style={{ ...field, minHeight: 90 }}
            name="skills"
            defaultValue={space?.skills.join(", ") ?? ""}
          />
        </label>
        <p style={hint}>What you can do, separated by commas. Up to {MAX_SKILLS}.</p>
        <label>
          About
          <textarea
            style={{ ...field, minHeight: 150 }}
            name="about"
            defaultValue={space?.about ?? ""}
            maxLength={1000}
          />
        </label>
        <button style={button} type="submit">
          {space ? "Save" : "Create my space"}
        </button>
      </form>
      {space ? (
        <section id="chronology">
          <h2 style={sectionTitle}>Chronology</h2>
          <p style={hint}>
            What happened, what you made, what you plan. Each entry appears on your page as a light
            on a line.
          </p>
          {added ? <p>Added to your chronology.</p> : null}
          <form method="post" action="/api/events" style={{ margin: "22px 0 44px" }}>
            <label>
              Day
              <input style={field} type="date" name="day" defaultValue={today} required />
            </label>
            <label>
              What happened
              <input style={field} name="title" maxLength={TITLE_MAX} required />
            </label>
            <label>
              Details
              <textarea style={{ ...field, minHeight: 110 }} name="body" maxLength={BODY_MAX} />
            </label>
            {events.length > 0 ? (
              <label>
                Continues
                <select style={field} name="continues" defaultValue="">
                  <option value="">Nothing, it stands on its own</option>
                  {events.slice(0, 50).map((event) => (
                    <option key={event.id} value={event.id}>
                      {event.happenedOn} · {event.title}
                    </option>
                  ))}
                </select>
              </label>
            ) : null}
            <label style={{ display: "flex", alignItems: "center", gap: 10, margin: "0 0 22px" }}>
              <input type="checkbox" name="only_me" /> Only I can see it
            </label>
            <button style={button} type="submit">
              Add to chronology
            </button>
          </form>
          <Timeline
            events={events}
            action={(event) => (
              <form method="post" action="/api/events/delete" style={{ margin: "10px 0 0" }}>
                <input type="hidden" name="id" value={event.id} />
                <button
                  type="submit"
                  style={{
                    background: "none",
                    border: 0,
                    padding: 0,
                    color: "#a39b8f",
                    font: "inherit",
                    fontSize: 15,
                    textDecoration: "underline",
                    cursor: "pointer",
                  }}
                >
                  Remove
                </button>
              </form>
            )}
          />
        </section>
      ) : null}
      {space ? (
        <p style={{ margin: "44px 0 0" }}>
          <a href="/communities">Communities</a> · <a href="/communities/new">Start a community</a>{" "}
          · <a href="/map">Map</a>
        </p>
      ) : null}
      <PasskeyAdd count={passkeys} />
      <p style={{ ...hint, margin: "34px 0 10px" }}>
        Signed in as {user.email}. Your e-mail is never shown on your page.
      </p>
      <form method="post" action="/api/auth/logout">
        <button style={{ ...button, background: "transparent", color: "#f3efe6" }} type="submit">
          Sign out
        </button>
      </form>
    </Screen>
  );
}
