import { notFound, redirect } from "next/navigation";
import { authEnabled } from "@/identity/config";
import { currentUser } from "@/identity/session";
import { getT } from "@/i18n/server";
import { PasskeySignIn } from "../passkey-buttons";
import { button, field, Screen } from "../ui";

export const dynamic = "force-dynamic";

export default async function Login() {
  if (!authEnabled()) notFound();
  if (await currentUser()) redirect("/me");
  const { t } = await getT();
  return (
    <Screen title={t.login.title}>
      <p>{t.login.lead}</p>
      <form method="post" action="/api/auth/request">
        <label>
          {t.login.email}
          <input style={field} type="email" name="email" autoComplete="email" required />
        </label>
        <button style={button} type="submit">
          {t.login.send}
        </button>
      </form>
      <PasskeySignIn text={t.passkey} />
      <p style={{ color: "#a39b8f", fontSize: 15, marginTop: 34 }}>
        {t.login.store} <a href="/privacy">{t.login.privacy}</a>. {t.login.runs}{" "}
        <a href="/legal">{t.login.legal}</a>.
      </p>
    </Screen>
  );
}
