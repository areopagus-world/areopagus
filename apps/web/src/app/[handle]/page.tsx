import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { publicTimeline } from "@/chronology/store";
import { communitiesOfSpace, findCommunity } from "@/communities/store";
import { getT } from "@/i18n/server";
import { recentQuestions } from "@/questions/store";
import { checkLevel } from "@/snapshots/rules";
import { checkHandle } from "@/spaces/rules";
import { findSpaceByHandle } from "@/spaces/store";
import { levelTitle } from "@/spiral/rules";
import { spiralOf } from "@/spiral/store";
import { CommunityList } from "../community-list";
import { QuestionList } from "../question-list";
import { SpiralView } from "../spiral";
import { reportEvent, sectionTitle, Timeline } from "../timeline";
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
  const { t } = await getT();
  return found
    ? { title: `${found.name} · ${t.brand}`, description: found.about.slice(0, 160) }
    : {};
}

/** The public page behind an address: a space, or a community. areopagus.world/<handle>. */
export default async function SpacePage({
  params,
  searchParams,
}: {
  params: Promise<{ handle: string }>;
  searchParams: Promise<{ problem?: string; level?: string }>;
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
  const [all, communities, questions, spiral, query, { t }] = await Promise.all([
    publicTimeline(space.handle),
    communitiesOfSpace(space.handle),
    recentQuestions({ toHandle: space.handle }),
    spiralOf({ handle: space.handle }, "public"),
    searchParams,
    getT(),
  ]);
  // A level picked in the spiral narrows the chronology; without a shown spiral there is no picking.
  const level = spiral ? checkLevel(query.level) : undefined;
  const events = level ? all.filter((event) => event.level === level) : all;
  const levelName = level ? levelTitle(spiral?.levels, level, t.snapshots.levels) : undefined;
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
          <h2 style={sectionTitle}>{t.space.communities}</h2>
          <CommunityList communities={communities} />
        </section>
      ) : null}
      {spiral ? (
        <section id="spiral">
          <h2 style={sectionTitle}>{t.spiral.title}</h2>
          <p style={{ color: "#a39b8f", margin: 0, maxWidth: 620 }}>{t.spiral.lead}</p>
          <SpiralView
            spiral={spiral}
            t={t}
            current={level}
            href={(pick) =>
              pick ? `/${space.handle}?level=${pick}#chronology` : `/${space.handle}#chronology`
            }
          />
        </section>
      ) : null}
      {all.length > 0 ? (
        <section id="chronology">
          <h2 style={sectionTitle}>{t.space.chronology}</h2>
          {levelName ? (
            <p style={{ color: "#a39b8f" }}>
              {t.spiral.filtered(levelName)}{" "}
              <a href={`/${space.handle}#chronology`}>{t.spiral.all}</a>
            </p>
          ) : null}
          <Timeline events={events} action={(event) => reportEvent(event, t.common.report)} />
        </section>
      ) : null}
      <section>
        <h2 style={sectionTitle}>{t.space.questions}</h2>
        {questions.length > 0 ? <QuestionList questions={questions} /> : null}
        <p style={{ margin: "22px 0 0" }}>
          <a href={`/questions/new?to=${space.handle}`}>{t.space.ask(space.name)}</a>
        </p>
      </section>
      <p style={{ margin: "64px 0 0", fontSize: 14 }}>
        <a href={`/report?space=${space.handle}`} style={{ color: "#6b645b" }}>
          {t.common.reportPage}
        </a>
      </p>
    </main>
  );
}
