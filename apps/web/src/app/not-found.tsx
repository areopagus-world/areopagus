import { getT } from "@/i18n/server";
import { Screen } from "./ui";

/** Shown for every address that leads nowhere, in the reader's language. */
export default async function NotFound() {
  const { t } = await getT();
  return (
    <Screen title={t.notFound.title}>
      <p>{t.notFound.text}</p>
      <p style={{ marginTop: 28 }}>
        <a href="/" style={{ color: "#ff4a1c" }}>
          {t.notFound.home}
        </a>
      </p>
    </Screen>
  );
}
