import type { Metadata } from "next";
import { listCommunities } from "@/communities/store";
import { authEnabled } from "@/identity/config";
import { getT } from "@/i18n/server";
import { CommunityList } from "../community-list";
import { button, Screen } from "../ui";

export const dynamic = "force-dynamic";
export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getT();
  return { title: `${t.communities.title} · ${t.brand}` };
}

/** Every community of the network, biggest first. */
export default async function Communities() {
  const [communities, { t }] = await Promise.all([listCommunities(), getT()]);
  return (
    <Screen title={t.communities.title}>
      {communities.length === 0 ? (
        <p>{t.communities.empty}</p>
      ) : (
        <CommunityList communities={communities} />
      )}
      {authEnabled() ? (
        <p style={{ marginTop: 34 }}>
          <a
            href="/communities/new"
            style={{ ...button, display: "inline-block", textDecoration: "none" }}
          >
            {t.communities.start}
          </a>
        </p>
      ) : null}
    </Screen>
  );
}
