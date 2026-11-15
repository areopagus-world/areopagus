import { cleanText } from "../spaces/rules";

export const TITLE_MAX = 140;
export const BODY_MAX = 2000;
export const SKILL_MAX = 40;
export const MAX_QUESTIONS_PER_DAY = 10;
export const MAX_ANSWERS_PER_DAY = 50;

export type QuestionProblem = "title" | "skill";

export interface QuestionInput {
  title: string;
  body: string;
  skill: string;
}

/** A question needs a short title of its own; details and a skill are optional. */
export function checkQuestion(fields: {
  title: unknown;
  body: unknown;
  skill: unknown;
}): QuestionInput | { problem: QuestionProblem } {
  const title = cleanText(fields.title, TITLE_MAX);
  if (title.length < 5) return { problem: "title" };
  const skill = cleanText(fields.skill, SKILL_MAX + 1);
  if (skill.length > SKILL_MAX || /[,;]/.test(skill)) return { problem: "skill" };
  return { title, body: cleanText(fields.body, BODY_MAX, true), skill };
}

/** An answer is text of at least two characters. Undefined when there is nothing to save. */
export function checkAnswer(input: unknown): string | undefined {
  const body = cleanText(input, BODY_MAX, true);
  return body.length >= 2 ? body : undefined;
}
