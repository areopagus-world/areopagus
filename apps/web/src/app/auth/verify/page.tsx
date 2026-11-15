import { notFound } from "next/navigation";
import { authEnabled } from "@/identity/config";
import { LOGIN_TOKEN_MINUTES } from "@/identity/tokens";
import { getT } from "@/i18n/server";
import { button, Screen } from "../../ui";

export const dynamic = "force-dynamic";

/**
 * The link from the e-mail lands here. Signing in takes one more press of a button:
 * mail scanners that open links in advance then cannot use the link up.
 */
export default async function Verify({
  searchParams,
}: {
  searchParams: Promise<{ token?: string; failed?: string }>;
}) {
  if (!authEnabled()) notFound();
  const [{ token, failed }, { t }] = await Promise.all([searchParams, getT()]);
  if (failed || !token) {
    return (
      <Screen title={t.login.deadTitle}>
        <p>{t.login.deadText(LOGIN_TOKEN_MINUTES)}</p>
        <p>
          <a href="/login" style={{ color: "inherit" }}>
            {t.login.askNew}
          </a>
        </p>
      </Screen>
    );
  }
  return (
    <Screen title={t.login.almost}>
      <form method="post" action="/api/auth/verify">
        <input type="hidden" name="token" value={token} />
        <button style={button} type="submit">
          {t.login.confirm}
        </button>
      </form>
    </Screen>
  );
}
