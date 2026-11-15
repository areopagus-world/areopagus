import type { QuestionView } from "@/questions/store";

const mute = { color: "#a39b8f", fontSize: 15 } as const;

/** Questions as rows: title, who it is for or where, how many answers. */
export function QuestionList({ questions }: { questions: QuestionView[] }) {
  return (
    <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
      {questions.map((question) => (
        <li key={question.id} style={{ padding: "14px 0", borderBottom: "1px solid #3a342e" }}>
          <a
            href={`/questions/${question.id}`}
            style={{
              fontSize: 19,
              fontWeight: 600,
              textDecoration: "none",
              overflowWrap: "anywhere",
            }}
          >
            {question.title}
          </a>
          <p style={{ ...mute, margin: "4px 0 0" }}>
            {[
              question.to ? `to ${question.to.name}` : null,
              question.place ? `in ${question.place.name}` : null,
              question.skill || null,
              `${question.answers ?? 0} ${question.answers === 1 ? "answer" : "answers"}`,
            ]
              .filter(Boolean)
              .join(" · ")}
          </p>
        </li>
      ))}
    </ul>
  );
}
