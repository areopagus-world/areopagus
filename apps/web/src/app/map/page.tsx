import type { Metadata } from "next";
import { onMap, project } from "@/places/europe";
import { getT } from "@/i18n/server";
import { lights } from "@/places/store";
import { viewFromQuery } from "@/places/view";
import { MapView } from "./map-view";

export const dynamic = "force-dynamic";
export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getT();
  return { title: `${t.map.title} · ${t.brand}` };
}

/** Europe with a light for every settlement where someone has a space, to drag and zoom. */
export default async function MapPage({
  searchParams,
}: {
  searchParams: Promise<{ lat?: string; lon?: string; z?: string }>;
}) {
  const [found, { t }, query] = await Promise.all([lights(), getT(), searchParams]);
  const all = found.filter((light) => onMap(light.lon, light.lat));
  const people = all.reduce((sum, light) => sum + light.spaces, 0);
  return (
    <main style={{ maxWidth: 1100, margin: "0 auto", padding: "8vh 20px 12vh" }}>
      <p
        style={{
          letterSpacing: "0.14em",
          textTransform: "uppercase",
          fontSize: 13,
          color: "#a39b8f",
          margin: 0,
        }}
      >
        {t.beta}
      </p>
      <h1
        style={{
          fontFamily: "Unbounded, system-ui, sans-serif",
          fontWeight: 800,
          fontSize: "clamp(34px, 7vw, 72px)",
          lineHeight: 1,
          letterSpacing: "-0.03em",
          margin: "14px 0 10px",
        }}
      >
        {t.map.title}
      </h1>
      <p style={{ fontSize: 18, color: "#a39b8f", margin: "0 0 26px" }}>
        {all.length === 0 ? t.map.empty : t.map.lit(all.length, people)}
      </p>
      <MapView
        initial={viewFromQuery(query)}
        lights={all.map((light) => {
          const [x, y] = project(light.lon, light.lat);
          return {
            id: light.id,
            name: light.name,
            country: light.country,
            x,
            y,
            spaces: light.spaces,
          };
        })}
        labels={{
          aria: t.map.aria,
          zoomIn: t.map.zoomIn,
          zoomOut: t.map.zoomOut,
          reset: t.map.reset,
          north: t.map.north,
          south: t.map.south,
          west: t.map.west,
          east: t.map.east,
          hint: t.map.hint,
        }}
      />
      {all.length > 0 ? (
        <ul
          style={{
            listStyle: "none",
            padding: 0,
            margin: "26px 0 0",
            display: "flex",
            flexWrap: "wrap",
            gap: "8px 22px",
          }}
        >
          {all.map((light) => (
            <li key={light.id} style={{ fontSize: 17 }}>
              <a href={`/places/${light.id}`} style={{ color: "inherit" }}>
                {light.name}, {light.country}
              </a>
            </li>
          ))}
        </ul>
      ) : null}
      <p style={{ fontSize: 13, color: "#6b645b", marginTop: 30 }}>{t.map.credits}</p>
    </main>
  );
}
