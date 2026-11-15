import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { MAX_FOUNDED } from "@/communities/store";
import { authEnabled } from "@/identity/config";
import { currentUser } from "@/identity/session";
import { getT } from "@/i18n/server";
import { HANDLE_FIELD_PATTERN } from "@/spaces/rules";
import { PlaceField } from "../../me/place-field";
import { button, field, Screen } from "../../ui";

export const dynamic = "force-dynamic";
export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getT();
  return { title: `${t.communities.newTitle} · ${t.brand}` };
}

const hint = { color: "#a39b8f", fontSize: 15, margin: "-8px 0 16px" } as const;

export default async function NewCommunity({
  searchParams,
}: {
  searchParams: Promise<{ problem?: string }>;
}) {
  if (!authEnabled()) notFound();
  if (!(await currentUser())) redirect("/login");
  const [{ problem }, { t }] = await Promise.all([searchParams, getT()]);
  const problems: Record<string, string> = {
    format: t.common.problemFormat,
    reserved: t.common.problemReserved,
    taken: t.communities.problemTaken,
    name: t.common.problemName,
    "no-space": t.communities.problemNoSpace,
    limit: t.communities.problemLimit(MAX_FOUNDED),
  };
  return (
    <Screen title={t.communities.newTitle}>
      {problem && problems[problem] ? (
        <p style={{ color: "#ff4a1c" }}>{problems[problem]}</p>
      ) : null}
      <form method="post" action="/api/communities">
        <label>
          {t.common.address}
          <input
            style={field}
            name="handle"
            pattern={HANDLE_FIELD_PATTERN}
            title={t.common.addressPattern}
            minLength={3}
            maxLength={30}
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
            required
          />
        </label>
        <p style={hint}>{t.communities.addressHint}</p>
        <label>
          {t.common.name}
          <input style={field} name="name" maxLength={80} required />
        </label>
        <label>
          {t.common.place}
          <PlaceField initialLabel="" initialId="" />
        </label>
        <p style={hint}>{t.communities.placeHint}</p>
        <label>
          {t.communities.about}
          <textarea style={{ ...field, minHeight: 150 }} name="about" maxLength={1000} />
        </label>
        <button style={button} type="submit">
          {t.communities.submit}
        </button>
      </form>
    </Screen>
  );
}
