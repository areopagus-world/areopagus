import { getPool } from "@/db/pool";
import { MAX_ANSWERS_PER_DAY, MAX_QUESTIONS_PER_DAY, type QuestionInput } from "./rules";

export interface Person {
  handle: string;
  name: string;
}

export interface QuestionView {
  id: string;
  title: string;
  body: string;
  skill: string;
  createdAt: string;
  authorId: string;
  author: Person | null;
  to: Person | null;
  place: { id: string; name: string; country: string } | null;
  hiddenNote: string | null;
  answers?: number;
}

export interface AnswerView {
  id: string;
  body: string;
  createdAt: string;
  authorId: string;
  author: Person | null;
  thanked: boolean;
  hiddenNote: string | null;
}

const QUESTION = `
  select q.id, q.title, q.body, q.skill, to_char(q.created_at, 'YYYY-MM-DD') as "createdAt",
         q.author_id as "authorId",
         case when a.handle is null then null else json_build_object('handle', a.handle, 'name', a.name) end as author,
         case when t.handle is null then null else json_build_object('handle', t.handle, 'name', t.name) end as "to",
         case when p.id is null then null
              else json_build_object('id', p.id::text, 'name', p.name, 'country', p.country) end as place,
         case when q.hidden_at is null then null else coalesce(q.hidden_note, '') end as "hiddenNote",
         (select count(*)::int from answers x where x.question_id = q.id and x.hidden_at is null) as answers
  from questions q
  left join spaces a on a.user_id = q.author_id and a.hidden_at is null
  left join spaces t on t.id = q.to_space_id
  left join places p on p.id = q.place_id`;

export type AskTarget = { toHandle: string } | { placeId: string } | Record<string, never>;

/**
 * Asks a question. The asker needs a space: questions and answers are shown with the space's name.
 * Returns the new id, or why it was refused.
 */
export async function askQuestion(
  userId: string,
  input: QuestionInput,
  target: AskTarget,
): Promise<{ id: string } | "no-space" | "limit" | "no-target" | "self"> {
  const pool = getPool();
  const { rows } = await pool.query<{ space: boolean; today: number }>(
    `select exists (select 1 from spaces where user_id = $1 and hidden_at is null) as space,
            (select count(*)::int from questions where author_id = $1 and created_at > now() - interval '1 day') as today`,
    [userId],
  );
  const state = rows[0];
  if (!state?.space) return "no-space";
  if (state.today >= MAX_QUESTIONS_PER_DAY) return "limit";

  let toSpaceId: string | null = null;
  let placeId: string | null = null;
  if ("toHandle" in target) {
    const { rows: found } = await pool.query<{ id: string; user_id: string }>(
      "select id, user_id from spaces where handle = $1 and hidden_at is null",
      [target.toHandle],
    );
    if (!found[0]) return "no-target";
    if (found[0].user_id === userId) return "self";
    toSpaceId = found[0].id;
  } else if ("placeId" in target) {
    const { rows: found } = await pool.query("select 1 from places where id = $1", [
      target.placeId,
    ]);
    if (found.length === 0) return "no-target";
    placeId = target.placeId;
  }
  const { rows: created } = await pool.query<{ id: string }>(
    `insert into questions (author_id, to_space_id, place_id, skill, title, body)
     values ($1, $2, $3, $4, $5, $6) returning id`,
    [userId, toSpaceId, placeId, input.skill, input.title, input.body],
  );
  return { id: created[0]?.id ?? "" };
}

/** A question, hidden ones included: the page decides who may still see it. */
export async function findQuestion(id: string): Promise<QuestionView | undefined> {
  const { rows } = await getPool().query<QuestionView>(`${QUESTION} where q.id = $1`, [id]);
  return rows[0];
}

/** Answers of a question, oldest first. Hidden answers come back only to their own author. */
export async function answersOf(
  questionId: string,
  viewerId: string | undefined,
): Promise<AnswerView[]> {
  const { rows } = await getPool().query<AnswerView>(
    `select x.id, x.body, to_char(x.created_at, 'YYYY-MM-DD') as "createdAt", x.author_id as "authorId",
            case when s.handle is null then null else json_build_object('handle', s.handle, 'name', s.name) end as author,
            x.thanked_at is not null as thanked,
            case when x.hidden_at is null then null else coalesce(x.hidden_note, '') end as "hiddenNote"
     from answers x left join spaces s on s.user_id = x.author_id and s.hidden_at is null
     where x.question_id = $1 and (x.hidden_at is null or x.author_id = $2)
     order by x.created_at
     limit 500`,
    [questionId, viewerId ?? null],
  );
  return rows;
}

/** Recent visible questions: everywhere, to one person, or in one place. */
export async function recentQuestions(
  filter: { toHandle?: string; placeId?: string } = {},
): Promise<QuestionView[]> {
  const { rows } = await getPool().query<QuestionView>(
    `${QUESTION}
     where q.hidden_at is null
       and ($1::citext is null or t.handle = $1)
       and ($2::bigint is null or q.place_id = $2)
     order by q.created_at desc
     limit 50`,
    [filter.toHandle ?? null, filter.placeId ?? null],
  );
  return rows;
}

/** Adds an answer to a visible question. */
export async function addAnswer(
  userId: string,
  questionId: string,
  body: string,
): Promise<"added" | "no-space" | "limit" | "no-question"> {
  const pool = getPool();
  const { rows } = await pool.query<{ space: boolean; today: number; open: boolean }>(
    `select exists (select 1 from spaces where user_id = $1 and hidden_at is null) as space,
            (select count(*)::int from answers where author_id = $1 and created_at > now() - interval '1 day') as today,
            exists (select 1 from questions where id = $2 and hidden_at is null) as open`,
    [userId, questionId],
  );
  const state = rows[0];
  if (!state?.open) return "no-question";
  if (!state.space) return "no-space";
  if (state.today >= MAX_ANSWERS_PER_DAY) return "limit";
  await pool.query("insert into answers (question_id, author_id, body) values ($1, $2, $3)", [
    questionId,
    userId,
    body,
  ]);
  return "added";
}

/**
 * The asker thanks an answer, or takes the thanks back. Only the asker can, and not for their own answer.
 */
export async function toggleThanks(userId: string, answerId: string): Promise<string | undefined> {
  const { rows } = await getPool().query<{ question_id: string }>(
    `update answers x set thanked_at = case when x.thanked_at is null then now() else null end
     from questions q
     where x.id = $2 and q.id = x.question_id and q.author_id = $1 and x.author_id <> $1
       and x.hidden_at is null and q.hidden_at is null
     returning x.question_id`,
    [userId, answerId],
  );
  return rows[0]?.question_id;
}

export async function userOfSpace(handle: string): Promise<string | undefined> {
  const { rows } = await getPool().query<{ user_id: string }>(
    "select user_id from spaces where handle = $1",
    [handle],
  );
  return rows[0]?.user_id;
}
