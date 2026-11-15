import type { Metadata } from "next";
import { getT } from "@/i18n/server";
import { Screen } from "../../ui";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getT();
  return { title: `${t.report.sentTitle} · ${t.brand}`, robots: { index: false } };
}

export default async function ReportSent() {
  const { t } = await getT();
  return (
    <Screen title={t.report.sentTitle}>
      <p>{t.report.sentText}</p>
      <p>{t.report.sentAnswer}</p>
      <p style={{ marginTop: 34 }}>
        <a href="/">{t.report.back}</a>
      </p>
    </Screen>
  );
}
