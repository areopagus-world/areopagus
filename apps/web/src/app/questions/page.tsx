import type { Metadata } from "next";
import { authEnabled } from "@/identity/config";
import { getT } from "@/i18n/server";
import { recentQuestions } from "@/questions/store";
import { QuestionList } from "../question-list";
import { button, Screen } from "../ui";

export const dynamic = "force-dynamic";
export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getT();
  return { title: `${t.questions.title} · ${t.brand}` };
}

/** The newest questions of the network. */
export default async function Questions() {
  const [questions, { t }] = await Promise.all([recentQuestions(), getT()]);
  return (
    <Screen title={t.questions.title}>
      <p style={{ color: "#a39b8f", fontSize: 15, margin: "0 0 20px" }}>{t.questions.intro}</p>
      {authEnabled() ? (
        <p style={{ margin: "0 0 30px" }}>
          <a
            href="/questions/new"
            style={{ ...button, display: "inline-block", textDecoration: "none" }}
          >
            {t.questions.ask}
          </a>
        </p>
      ) : null}
      {questions.length === 0 ? <p>{t.questions.empty}</p> : <QuestionList questions={questions} />}
    </Screen>
  );
}
