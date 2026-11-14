import { BODY_MAX, TITLE_MAX } from "@/chronology/rules";
import { communityTimeline, membersOf, roleIn, type Community } from "@/communities/store";
import { authEnabled } from "@/identity/config";
import { currentUser } from "@/identity/session";
import { sectionTitle, Timeline } from "../timeline";
import { button, field } from "../ui";

const PROBLEMS: Record<string, string> = {
  space: "Create your space first, then join.",
  "event-date": "Choose a real day, not before 1900 and not more than a year ahead.",
  "event-title": "Say in a few words what happened.",
  "not-member": "Join the community to add to its chronology.",
  full: "The chronology is full.",
};
const quiet = { ...button, background: "transparent", color: "#f3efe6" } as const;
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

/** The public page of a community: areopagus.world/<handle>. */
export async function CommunityPage({
  community,
  problem,
}: {
  community: Community;
  problem?: string;
}) {
  const user = authEnabled() ? await currentUser() : undefined;
  const [members, events, role] = await Promise.all([
    membersOf(community.id),
    communityTimeline(community.id),
    user ? roleIn(user.id, community.id) : undefined,
  ]);
  const today = new Date().toISOString().slice(0, 10);
  const hidden = <input type="hidden" name="community" value={community.handle} />;
  return (
    <main style={{ maxWidth: 760, margin: "0 auto", padding: "12vh 20px 16vh" }}>
      <p
        style={{
          fontFamily: "ui-monospace, Menlo, monospace",
          fontSize: 14,
          color: "#a39b8f",
          margin: 0,
        }}
      >
        areopagus.world/{community.handle} · community
      </p>
      <h1
        style={{
          fontFamily: "Unbounded, system-ui, sans-serif",
          fontWeight: 800,
          fontSize: "clamp(36px, 8vw, 84px)",
          lineHeight: 1,
          letterSpacing: "-0.03em",
          margin: "18px 0 22px",
          overflowWrap: "anywhere",
        }}
      >
        {community.name}
      </h1>
      {community.place ? (
        <p style={{ fontSize: 19, margin: "0 0 30px" }}>
          {community.placeId ? (
            <a href={`/places/${community.placeId}`}>{community.place}</a>
          ) : (
            community.place
          )}
        </p>
      ) : null}
      {community.about ? (
        <p
          style={{
            fontSize: 20,
            lineHeight: 1.55,
            whiteSpace: "pre-wrap",
            maxWidth: 620,
            margin: "0 0 34px",
          }}
        >
          {community.about}
        </p>
      ) : null}
      {problem && PROBLEMS[problem] ? (
        <p style={{ color: "#ff4a1c" }}>{PROBLEMS[problem]}</p>
      ) : null}

      {user && !role ? (
        <form method="post" action="/api/communities/join">
          {hidden}
          <button style={button} type="submit">
            Join
          </button>
        </form>
      ) : null}
      {!user && authEnabled() ? (
        <p>
          <a href="/login">Sign in</a> to join.
        </p>
      ) : null}

      <h2 style={sectionTitle}>
        Members <span style={{ color: "#a39b8f" }}>{members.length}</span>
      </h2>
      <ul
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 10,
          listStyle: "none",
          margin: 0,
          padding: 0,
        }}
      >
        {members.map((member) => (
          <li key={member.handle}>
            <a
              href={`/${member.handle}`}
              style={{
                display: "block",
                padding: "9px 14px",
                border: `2px solid ${member.role === "founder" ? "#ff4a1c" : "#f3efe6"}`,
                fontSize: 16,
                fontWeight: 600,
                textDecoration: "none",
              }}
              title={member.role === "founder" ? "Founder" : undefined}
            >
              {member.name}
            </a>
          </li>
        ))}
      </ul>
      {role === "member" ? (
        <form method="post" action="/api/communities/leave" style={{ marginTop: 18 }}>
          {hidden}
          <button style={plain} type="submit">
            Leave the community
          </button>
        </form>
      ) : null}

      {events.length > 0 || role ? <h2 style={sectionTitle}>Chronology</h2> : null}
      {role ? (
        <form method="post" action="/api/communities/events" style={{ margin: "0 0 44px" }}>
          {hidden}
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
          <button style={quiet} type="submit">
            Add to the community&rsquo;s chronology
          </button>
        </form>
      ) : null}
      <Timeline
        events={events}
        action={(event) =>
          user && (event.authorId === user.id || role === "founder") ? (
            <form
              method="post"
              action="/api/communities/events/delete"
              style={{ margin: "10px 0 0" }}
            >
              {hidden}
              <input type="hidden" name="id" value={event.id} />
              <button style={plain} type="submit">
                Remove
              </button>
            </form>
          ) : null
        }
      />
    </main>
  );
}
