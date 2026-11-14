import type { Metadata } from "next";
import { MAP_HEIGHT, MAP_WIDTH, onMap, project } from "@/places/europe";
import { lights } from "@/places/store";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Map · Areopagus" };

/** Europe with a light for every settlement where someone has a space. */
export default async function MapPage() {
  const all = (await lights()).filter((light) => onMap(light.lon, light.lat));
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
        Areopagus beta
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
        The map
      </h1>
      <p style={{ fontSize: 18, color: "#a39b8f", margin: "0 0 26px" }}>
        {all.length === 0
          ? "No lights yet. The first one appears when someone ties a space to a place."
          : `${all.length} ${all.length === 1 ? "place is" : "places are"} lit by ${people} ${people === 1 ? "space" : "spaces"}.`}
      </p>
      <svg
        viewBox={`0 0 ${MAP_WIDTH} ${MAP_HEIGHT}`}
        role="img"
        aria-label="Map of Europe with a light for every place that has a space"
        style={{
          width: "100%",
          height: "auto",
          display: "block",
          overflow: "hidden",
          background: "#0e0c0a",
        }}
      >
        <defs>
          <radialGradient id="glow">
            <stop offset="0" stopColor="#ff4a1c" stopOpacity="0.9" />
            <stop offset="1" stopColor="#ff4a1c" stopOpacity="0" />
          </radialGradient>
        </defs>
        <image href="/map/outline.svg" width={MAP_WIDTH} height={MAP_HEIGHT} />
        {all.map((light) => {
          const [x, y] = project(light.lon, light.lat);
          const halo = 10 + Math.min(18, Math.sqrt(light.spaces) * 4);
          return (
            <a key={light.id} href={`/places/${light.id}`}>
              <title>{`${light.name}, ${light.country}`}</title>
              <circle cx={x} cy={y} r={halo} fill="url(#glow)" />
              <circle cx={x} cy={y} r="2.6" fill="#ffd9cc" />
            </a>
          );
        })}
      </svg>
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
      <p style={{ fontSize: 13, color: "#6b645b", marginTop: 30 }}>
        Places: GeoNames, CC BY 4.0. Outline: Natural Earth, public domain.
      </p>
    </main>
  );
}
