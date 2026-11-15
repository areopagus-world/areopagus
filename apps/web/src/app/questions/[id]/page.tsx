import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { eventId as uuid } from "@/chronology/rules";
import { authEnabled } from "@/identity/config";
import { currentUser } from "@/identity/session";
import { BODY_MAX, MAX_ANSWERS_PER_DAY } from "@/questions/rules";
import { answersOf, findQuestion } from "@/questions/store";
import { button, field } from "../../ui";

export const dynamic = "force-dynamic";

const mute = { color: "#a39b8f", fontSize: 15 } as const;
const small = { margin: "8px 0 0", fontSize: 14 } as const;
const plain = {
  background: "none",
  border: 0,
  padding: 0,
  color: "#a39b8f",
  font: "inherit",
  fontSize: 15,
  textDecoration: "underline",
  cursor: "pointer",
} as const;
const PROBLEMS: Record<string, string> = {
  answer: "Write the answer before sending it.",
  "no-space": "Create your space first: answers are shown with its name.",
  limit: `You can answer up to ${MAX_ANSWERS_PER_DAY} times a day.`,
};

async function load(raw: string) {
  const id = uuid(raw);
  return id ? findQuestion(id) : undefined;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const question = await load((await params).id);
  return question && question.hiddenNote == null
    ? { title: `${question.title} · Areopagus`, description: question.body.slice(0, 160) }
    : {};
}

/** A question with its answers. A hidden question is shown only to its author, with the reason. */
export default async function QuestionPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ problem?: string }>;
}) {
  const question = await load((await params).id);
  if (!question) notFound();
  const user = authEnabled() ? await currentUser() : undefined;
  const asker = user?.id === question.authorId;
  if (question.hiddenNote != null && !asker) notFound();
  const [answers, { problem }] = await Promise.all([
    answersOf(question.id, user?.id),
    searchParams,
  ]);
  const meta = [
    question.author ? (
      <a key="a" href={`/${question.author.handle}`}>
        {question.author.name}
      </a>
    ) : (
      "Someone"
    ),
    question.to ? (
      <span key="t">
        {" asked "}
        <a href={`/${question.to.handle}`}>{question.to.name}</a>
      </span>
    ) : question.place ? (
      <span key="p">
        {" asked the people of "}
        <a href={`/places/${question.place.id}`}>{question.place.name}</a>
      </span>
    ) : (
      <span key="e"> asked everyone</span>
    ),
    <span key="d"> · {question.createdAt}</span>,
    question.skill ? (
      <span key="s">
        {" · "}
        <a href={`/search?q=${encodeURIComponent(question.skill)}`}>{question.skill}</a>
      </span>
    ) : null,
  ];
  return (
    <main style={{ maxWidth: 760, margin: "0 auto", padding: "12vh 20px 16vh" }}>
      <p style={{ ...mute, margin: 0 }}>{meta}</p>
      <h1
        style={{
          fontFamily: "Unbounded, system-ui, sans-serif",
          fontWeight: 800,
          fontSize: "clamp(28px, 5vw, 48px)",
          lineHeight: 1.08,
          letterSpacing: "-0.02em",
          margin: "14px 0 18px",
          overflowWrap: "anywhere",
        }}
      >
        {question.title}
      </h1>
      {question.hiddenNote != null ? (
        <p style={{ color: "#ff4a1c" }}>
          A moderator has hidden this question
          {question.hiddenNote ? `: ${question.hiddenNote}` : "."}
        </p>
      ) : null}
      {question.body ? (
        <p style={{ fontSize: 19, lineHeight: 1.55, whiteSpace: "pre-wrap", maxWidth: 640 }}>
          {question.body}
        </p>
      ) : null}

      <h2 id="answers" style={{ fontSize: 22, margin: "48px 0 10px" }}>
        {answers.length === 0
          ? "No answers yet"
          : `${answers.length} ${answers.length === 1 ? "answer" : "answers"}`}
      </h2>
      <ol style={{ listStyle: "none", padding: 0, margin: 0 }}>
        {answers.map((answer) => (
          <li
            key={answer.id}
            id={`a-${answer.id}`}
            style={{
              padding: "18px 0 18px 18px",
              borderLeft: `3px solid ${answer.thanked ? "#ff4a1c" : "#3a342e"}`,
              margin: "0 0 14px",
            }}
          >
            <p style={{ ...mute, margin: 0 }}>
              {answer.author ? (
                <a href={`/${answer.author.handle}`}>{answer.author.name}</a>
              ) : (
                "Someone"
              )}{" "}
              · {answer.createdAt}
              {answer.thanked ? (
                <span style={{ color: "#ff4a1c" }}> · thanked by the asker</span>
              ) : null}
            </p>
            {answer.hiddenNote != null ? (
              <p style={{ color: "#ff4a1c", margin: "6px 0 0" }}>
                Hidden by a moderator{answer.hiddenNote ? `: ${answer.hiddenNote}` : "."} Only you
                see it.
              </p>
            ) : null}
            <p
              style={{ fontSize: 18, lineHeight: 1.55, whiteSpace: "pre-wrap", margin: "8px 0 0" }}
            >
              {answer.body}
            </p>
            {asker && answer.authorId !== user?.id && answer.hiddenNote == null ? (
              <form method="post" action="/api/questions/thank" style={small}>
                <input type="hidden" name="answer" value={answer.id} />
                <button style={plain} type="submit">
                  {answer.thanked ? "Take back the thanks" : "Thank for this answer"}
                </button>
              </form>
            ) : answer.authorId !== user?.id ? (
              <p style={small}>
                <a href={`/report?answer=${answer.id}`} style={{ color: "#6b645b" }}>
                  Report
                </a>
              </p>
            ) : null}
          </li>
        ))}
      </ol>

      {problem && PROBLEMS[problem] ? (
        <p style={{ color: "#ff4a1c" }}>{PROBLEMS[problem]}</p>
      ) : null}
      {user && question.hiddenNote == null ? (
        <form method="post" action="/api/questions/answer" style={{ marginTop: 30 }}>
          <input type="hidden" name="question" value={question.id} />
          <label>
            Your answer
            <textarea
              style={{ ...field, minHeight: 130 }}
              name="body"
              maxLength={BODY_MAX}
              required
            />
          </label>
          <button style={button} type="submit">
            Answer
          </button>
        </form>
      ) : null}
      {!user && authEnabled() ? (
        <p style={{ marginTop: 30 }}>
          <a href="/login">Sign in</a> to answer.
        </p>
      ) : null}

      <p style={{ ...mute, margin: "64px 0 0", fontSize: 14 }}>
        <a href="/questions">All questions</a>
        {asker ? null : (
          <>
            {" · "}
            <a href={`/report?question=${question.id}`} style={{ color: "#6b645b" }}>
              Report this question
            </a>
          </>
        )}
      </p>
    </main>
  );
}
