import type { Metadata } from "next";
import { Screen } from "../../ui";

export const metadata: Metadata = { title: "Report sent · Areopagus", robots: { index: false } };

export default function ReportSent() {
  return (
    <Screen title="Report sent">
      <p>Thank you. A person will read it and decide whether the content stays or is hidden.</p>
      <p>If you left an e-mail address, the answer will come there.</p>
      <p style={{ marginTop: 34 }}>
        <a href="/">Back to Areopagus</a>
      </p>
    </Screen>
  );
}
