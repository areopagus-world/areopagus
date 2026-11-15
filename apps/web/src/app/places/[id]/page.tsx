import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { communitiesAt } from "@/communities/store";
import { authEnabled } from "@/identity/config";
import { currentUser } from "@/identity/session";
import { getT } from "@/i18n/server";
import { recentQuestions } from "@/questions/store";
import { findPlace, spacesAt } from "@/places/store";
import { checkLevel, type Level } from "@/snapshots/rules";
import { ownSnapshots, placeSnapshots } from "@/snapshots/store";
import { findSpaceByUser } from "@/spaces/store";
import { CommunityList } from "../../community-list";
import { QuestionList } from "../../question-list";
import { Screen } from "../../ui";
import { Snapshots, type SnapshotAccess } from "./snapshots";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const place = await findPlace((await params).id);
  const { t } = await getT();
  return place ? { title: `${place.name} · ${t.brand}` } : {};
}

/** A settlement, the spaces of people who live there, and how they see it. */
export default async function PlacePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ saved?: string; problem?: string }>;
}) {
  const place = await findPlace((await params).id);
  if (!place) notFound();
  const user = authEnabled() ? await currentUser() : undefined;
  const [spaces, communities, questions, views, own, mySpace, query, { t }] = await Promise.all([
    spacesAt(place.id),
    communitiesAt(place.id),
    recentQuestions({ placeId: place.id }),
    placeSnapshots(place.id),
    user
      ? ownSnapshots(user.id, place.id)
      : Promise.resolve(new Map<Level, { value: number; day: string }>()),
    user ? findSpaceByUser(user.id) : Promise.resolve(undefined),
    searchParams,
    getT(),
  ]);
  const access: SnapshotAccess = !authEnabled()
    ? "off"
    : !user
      ? "sign-in"
      : !mySpace || mySpace.hiddenNote != null
        ? "need-space"
        : "record";
  return (
    <Screen title={`${place.name}, ${place.country}`}>
      {spaces.length === 0 ? (
        <p>{t.place.empty}</p>
      ) : (
        <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
          {spaces.map((space) => (
            <li
              key={space.handle}
              style={{ padding: "12px 0", borderBottom: "1px solid #3a342e", fontSize: 20 }}
            >
              <a href={`/${space.handle}`} style={{ color: "inherit", textDecoration: "none" }}>
                {space.name}
              </a>
            </li>
          ))}
        </ul>
      )}
      {communities.length > 0 ? (
        <>
          <h2 style={{ fontSize: 22, margin: "40px 0 6px" }}>{t.place.communities}</h2>
          <CommunityList communities={communities} />
        </>
      ) : null}
      {questions.length > 0 ? (
        <>
          <h2 style={{ fontSize: 22, margin: "40px 0 6px" }}>{t.place.questions}</h2>
          <QuestionList questions={questions} />
        </>
      ) : null}
      <Snapshots
        placeId={place.id}
        views={views}
        own={own}
        access={access}
        saved={checkLevel(query.saved)}
        problem={query.problem}
        t={t}
      />
      <p style={{ marginTop: 28 }}>
        <a href="/map" style={{ color: "#ff4a1c" }}>
          {t.place.back}
        </a>
        {" · "}
        <a href={`/search?place_id=${place.id}`}>{t.place.searchHere}</a>
        {" · "}
        <a href={`/questions/new?place_id=${place.id}`}>{t.place.askHere}</a>
      </p>
    </Screen>
  );
}
