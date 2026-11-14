import type { CommunityCard } from "@/communities/store";

/** Communities as rows: name, place, number of members. */
export function CommunityList({ communities }: { communities: CommunityCard[] }) {
  return (
    <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
      {communities.map((community) => (
        <li key={community.handle} style={{ padding: "14px 0", borderBottom: "1px solid #3a342e" }}>
          <a
            href={`/${community.handle}`}
            style={{ fontSize: 20, fontWeight: 600, textDecoration: "none" }}
          >
            {community.name}
          </a>
          <span style={{ color: "#a39b8f", fontSize: 15, marginLeft: 12 }}>
            {community.place ? `${community.place} · ` : ""}
            {community.members} {community.members === 1 ? "member" : "members"}
          </span>
        </li>
      ))}
    </ul>
  );
}
