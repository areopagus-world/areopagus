import type { Metadata } from "next";
import { authEnabled } from "@/identity/config";
import { recentQuestions } from "@/questions/store";
import { QuestionList } from "../question-list";
import { button, Screen } from "../ui";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Questions · Areopagus" };

/** The newest questions of the network. */
export default async function Questions() {
  const questions = await recentQuestions();
  return (
    <Screen title="Questions">
      <p style={{ color: "#a39b8f", fontSize: 15, margin: "0 0 20px" }}>
        Ask a person, the people of a place, or everyone. Questions and answers are public.
      </p>
      {authEnabled() ? (
        <p style={{ margin: "0 0 30px" }}>
          <a
            href="/questions/new"
            style={{ ...button, display: "inline-block", textDecoration: "none" }}
          >
            Ask a question
          </a>
        </p>
      ) : null}
      {questions.length === 0 ? <p>No questions yet.</p> : <QuestionList questions={questions} />}
    </Screen>
  );
}
