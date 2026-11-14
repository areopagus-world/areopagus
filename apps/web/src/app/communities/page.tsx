import type { Metadata } from "next";
import { listCommunities } from "@/communities/store";
import { authEnabled } from "@/identity/config";
import { CommunityList } from "../community-list";
import { button, Screen } from "../ui";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Communities · Areopagus" };

/** Every community of the network, biggest first. */
export default async function Communities() {
  const communities = await listCommunities();
  return (
    <Screen title="Communities">
      {communities.length === 0 ? (
        <p>No communities yet. The first one can be yours.</p>
      ) : (
        <CommunityList communities={communities} />
      )}
      {authEnabled() ? (
        <p style={{ marginTop: 34 }}>
          <a
            href="/communities/new"
            style={{ ...button, display: "inline-block", textDecoration: "none" }}
          >
            Start a community
          </a>
        </p>
      ) : null}
    </Screen>
  );
}
