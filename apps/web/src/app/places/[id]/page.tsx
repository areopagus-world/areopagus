import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { communitiesAt } from "@/communities/store";
import { getT } from "@/i18n/server";
import { recentQuestions } from "@/questions/store";
import { findPlace, spacesAt } from "@/places/store";
import { CommunityList } from "../../community-list";
import { QuestionList } from "../../question-list";
import { Screen } from "../../ui";

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

/** A settlement and the spaces of people who live there. */
export default async function PlacePage({ params }: { params: Promise<{ id: string }> }) {
  const place = await findPlace((await params).id);
  if (!place) notFound();
  const [spaces, communities, questions, { t }] = await Promise.all([
    spacesAt(place.id),
    communitiesAt(place.id),
    recentQuestions({ placeId: place.id }),
    getT(),
  ]);
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
