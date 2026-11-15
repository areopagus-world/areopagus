import type { Metadata } from "next";
import { findPlace, placeLabel } from "@/places/store";
import { cleanQuery } from "@/search/rules";
import { searchCommunities, searchPeople } from "@/search/store";
import { CommunityList } from "../community-list";
import { PlaceField } from "../me/place-field";
import { button, field, Screen } from "../ui";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Search · Areopagus" };

const h2 = { fontSize: 22, margin: "44px 0 6px" } as const;
const mute = { color: "#a39b8f", fontSize: 15 } as const;

/** Find people by what they can do and where they live, and communities by what they are for. */
export default async function Search({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; place_id?: string }>;
}) {
  const params = await searchParams;
  const query = cleanQuery(params.q);
  const place = params.place_id ? await findPlace(params.place_id) : undefined;
  const asked = Boolean(query || place);
  const [people, communities] = await Promise.all([
    searchPeople(query, place?.id),
    searchCommunities(query, place?.id),
  ]);
  return (
    <Screen title="Search">
      <form method="get" action="/search">
        <label>
          What
          <input
            style={field}
            name="q"
            defaultValue={query ?? ""}
            maxLength={60}
            placeholder="a skill, a name, a word"
            autoCapitalize="none"
          />
        </label>
        <label>
          Where
          <PlaceField initialLabel={place ? placeLabel(place) : ""} initialId={place?.id ?? ""} />
        </label>
        <p style={{ ...mute, margin: "-8px 0 16px" }}>
          Leave empty to search everywhere, or pick a town from the list.
        </p>
        <button style={button} type="submit">
          Search
        </button>
      </form>

      {asked ? (
        <>
          <h2 style={h2}>
            People <span style={mute}>{people.length}</span>
          </h2>
          {people.length === 0 ? (
            <p style={mute}>
              No one found. The network is young: you may be the first with this skill here.
            </p>
          ) : (
            <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
              {people.map((person) => (
                <li
                  key={person.handle}
                  style={{ padding: "14px 0", borderBottom: "1px solid #3a342e" }}
                >
                  <a
                    href={`/${person.handle}`}
                    style={{ fontSize: 20, fontWeight: 600, textDecoration: "none" }}
                  >
                    {person.name}
                  </a>
                  {person.place ? (
                    <span style={{ ...mute, marginLeft: 12 }}>{person.place}</span>
                  ) : null}
                  {person.skills.length > 0 ? (
                    <p style={{ margin: "6px 0 0", fontSize: 16 }}>{person.skills.join(" · ")}</p>
                  ) : null}
                </li>
              ))}
            </ul>
          )}
          {communities.length > 0 ? (
            <>
              <h2 style={h2}>
                Communities <span style={mute}>{communities.length}</span>
              </h2>
              <CommunityList communities={communities} />
            </>
          ) : null}
        </>
      ) : null}
    </Screen>
  );
}
