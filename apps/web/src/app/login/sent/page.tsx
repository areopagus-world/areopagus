import { LOGIN_TOKEN_MINUTES } from "@/identity/tokens";
import { getT } from "@/i18n/server";
import { Screen } from "../../ui";

export const dynamic = "force-dynamic";

export default async function Sent() {
  const { t } = await getT();
  return (
    <Screen title={t.login.sentTitle}>
      <p>{t.login.sentText(LOGIN_TOKEN_MINUTES)}</p>
      <p style={{ color: "#a39b8f" }}>{t.login.sentHelp}</p>
    </Screen>
  );
}
