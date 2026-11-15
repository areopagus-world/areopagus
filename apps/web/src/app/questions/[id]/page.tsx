import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { eventId as uuid } from "@/chronology/rules";
import { authEnabled } from "@/identity/config";
import { currentUser } from "@/identity/session";
import { formatDay } from "@/i18n/locales";
import { getT } from "@/i18n/server";
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
  const { t } = await getT();
  return question && question.hiddenNote == null
    ? { title: `${question.title} · ${t.brand}`, description: question.body.slice(0, 160) }
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
  const [answers, { problem }, { locale, t }] = await Promise.all([
    answersOf(question.id, user?.id),
    searchParams,
    getT(),
  ]);
  const problems: Record<string, string> = {
    answer: t.questions.problemAnswer,
    "no-space": t.questions.problemAnswerNoSpace,
    limit: t.questions.problemAnswerLimit(MAX_ANSWERS_PER_DAY),
  };
  const meta = [
    <span key="f">{t.questions.from} </span>,
    question.author ? (
      <a key="a" href={`/${question.author.handle}`}>
        {question.author.name}
      </a>
    ) : (
      <span key="a">{t.questions.someone}</span>
    ),
    question.to ? (
      <span key="t">
        {` · ${t.questions.toLabel} `}
        <a href={`/${question.to.handle}`}>{question.to.name}</a>
      </span>
    ) : question.place ? (
      <span key="p">
        {` · ${t.questions.toPlace} `}
        <a href={`/places/${question.place.id}`}>{question.place.name}</a>
      </span>
    ) : (
      <span key="e"> · {t.questions.toEveryone}</span>
    ),
    <span key="d"> · {formatDay(question.createdAt, locale)}</span>,
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
        <p style={{ color: "#ff4a1c" }}>{t.questions.hiddenQuestion(question.hiddenNote)}</p>
      ) : null}
      {question.body ? (
        <p style={{ fontSize: 19, lineHeight: 1.55, whiteSpace: "pre-wrap", maxWidth: 640 }}>
          {question.body}
        </p>
      ) : null}

      <h2 id="answers" style={{ fontSize: 22, margin: "48px 0 10px" }}>
        {answers.length === 0 ? t.questions.noAnswers : t.common.answers(answers.length)}
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
                t.questions.someone
              )}{" "}
              · {formatDay(answer.createdAt, locale)}
              {answer.thanked ? (
                <span style={{ color: "#ff4a1c" }}> · {t.questions.thanked}</span>
              ) : null}
            </p>
            {answer.hiddenNote != null ? (
              <p style={{ color: "#ff4a1c", margin: "6px 0 0" }}>
                {t.questions.hiddenAnswer(answer.hiddenNote)}
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
                  {answer.thanked ? t.questions.takeBack : t.questions.thank}
                </button>
              </form>
            ) : answer.authorId !== user?.id ? (
              <p style={small}>
                <a href={`/report?answer=${answer.id}`} style={{ color: "#6b645b" }}>
                  {t.common.report}
                </a>
              </p>
            ) : null}
          </li>
        ))}
      </ol>

      {problem && problems[problem] ? (
        <p style={{ color: "#ff4a1c" }}>{problems[problem]}</p>
      ) : null}
      {user && question.hiddenNote == null ? (
        <form method="post" action="/api/questions/answer" style={{ marginTop: 30 }}>
          <input type="hidden" name="question" value={question.id} />
          <label>
            {t.questions.yourAnswer}
            <textarea
              style={{ ...field, minHeight: 130 }}
              name="body"
              maxLength={BODY_MAX}
              required
            />
          </label>
          <button style={button} type="submit">
            {t.questions.answer}
          </button>
        </form>
      ) : null}
      {!user && authEnabled() ? (
        <p style={{ marginTop: 30 }}>
          <a href="/login">{t.questions.signInToAnswer}</a>
        </p>
      ) : null}

      <p style={{ ...mute, margin: "64px 0 0", fontSize: 14 }}>
        <a href="/questions">{t.questions.all}</a>
        {asker ? null : (
          <>
            {" · "}
            <a href={`/report?question=${question.id}`} style={{ color: "#6b645b" }}>
              {t.questions.report}
            </a>
          </>
        )}
      </p>
    </main>
  );
}
