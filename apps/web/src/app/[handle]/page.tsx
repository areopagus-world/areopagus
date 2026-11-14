import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { checkHandle } from "@/spaces/rules";
import { findSpaceByHandle } from "@/spaces/store";

export const dynamic = "force-dynamic";

async function load(raw: string) {
  const checked = checkHandle(decodeURIComponent(raw));
  return "handle" in checked ? findSpaceByHandle(checked.handle) : undefined;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ handle: string }>;
}): Promise<Metadata> {
  const space = await load((await params).handle);
  return space
    ? { title: `${space.name} · Areopagus`, description: space.about.slice(0, 160) }
    : {};
}

/** The public page of a space: areopagus.world/<handle>. */
export default async function SpacePage({ params }: { params: Promise<{ handle: string }> }) {
  const space = await load((await params).handle);
  if (!space) notFound();
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
            <li
              key={skill}
              style={{
                padding: "9px 14px",
                border: "2px solid #f3efe6",
                fontSize: 16,
                fontWeight: 600,
              }}
            >
              {skill}
            </li>
          ))}
        </ul>
      ) : null}
    </main>
  );
}
