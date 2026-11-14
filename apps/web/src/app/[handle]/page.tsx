import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { publicTimeline } from "@/chronology/store";
import { communitiesOfSpace, findCommunity } from "@/communities/store";
import { checkHandle } from "@/spaces/rules";
import { findSpaceByHandle } from "@/spaces/store";
import { CommunityList } from "../community-list";
import { sectionTitle, Timeline } from "../timeline";
import { CommunityPage } from "./community";

export const dynamic = "force-dynamic";

function handleOf(raw: string): string | undefined {
  const checked = checkHandle(decodeURIComponent(raw));
  return "handle" in checked ? checked.handle : undefined;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ handle: string }>;
}): Promise<Metadata> {
  const handle = handleOf((await params).handle);
  const found = handle
    ? ((await findSpaceByHandle(handle)) ?? (await findCommunity(handle)))
    : undefined;
  return found
    ? { title: `${found.name} · Areopagus`, description: found.about.slice(0, 160) }
    : {};
}

/** The public page behind an address: a space, or a community. areopagus.world/<handle>. */
export default async function SpacePage({
  params,
  searchParams,
}: {
  params: Promise<{ handle: string }>;
  searchParams: Promise<{ problem?: string }>;
}) {
  const handle = handleOf((await params).handle);
  if (!handle) notFound();
  const space = await findSpaceByHandle(handle);
  if (!space) {
    const community = await findCommunity(handle);
    if (!community) notFound();
    const { problem } = await searchParams;
    return problem ? (
      <CommunityPage community={community} problem={problem} />
    ) : (
      <CommunityPage community={community} />
    );
  }
  const [events, communities] = await Promise.all([
    publicTimeline(space.handle),
    communitiesOfSpace(space.handle),
  ]);
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
        areopagus.world/{space.handle}
      </p>
      <h1
        style={{
          fontFamily: "Unbounded, system-ui, sans-serif",
          fontWeight: 800,
          fontSize: "clamp(40px, 9vw, 96px)",
          lineHeight: 0.98,
          letterSpacing: "-0.03em",
          margin: "18px 0 22px",
          overflowWrap: "anywhere",
        }}
      >
        {space.name}
      </h1>
      {space.place ? (
        <p
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            fontSize: 19,
            margin: "0 0 34px",
          }}
        >
          <span
            aria-hidden="true"
            style={{
              width: 9,
              height: 9,
              borderRadius: "50%",
              background: "#ff4a1c",
              boxShadow: "0 0 14px #ff4a1c",
            }}
          />
          {space.placeId ? (
            <a href={`/places/${space.placeId}`} style={{ color: "inherit" }}>
              {space.place}
            </a>
          ) : (
            space.place
          )}
        </p>
      ) : null}
      {space.about ? (
        <p
          style={{
            fontSize: 20,
            lineHeight: 1.55,
            whiteSpace: "pre-wrap",
            maxWidth: 620,
            margin: "0 0 40px",
          }}
        >
          {space.about}
        </p>
      ) : null}
      {space.skills.length > 0 ? (
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
          {space.skills.map((skill) => (
            <li key={skill}>
              <a
                href={`/search?q=${encodeURIComponent(skill)}`}
                style={{
                  padding: "9px 14px",
                  border: "2px solid #f3efe6",
                  fontSize: 16,
                  fontWeight: 600,
                  display: "block",
                  textDecoration: "none",
                }}
              >
                {skill}
              </a>
            </li>
          ))}
        </ul>
      ) : null}
      {communities.length > 0 ? (
        <section>
          <h2 style={sectionTitle}>Communities</h2>
          <CommunityList communities={communities} />
        </section>
      ) : null}
      {events.length > 0 ? (
        <section>
          <h2 style={sectionTitle}>Chronology</h2>
          <Timeline events={events} />
        </section>
      ) : null}
    </main>
  );
}
