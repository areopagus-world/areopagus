import { cleanText } from "../spaces/rules";

export const MAX_EVENTS = 500;
export const TITLE_MAX = 120;
export const BODY_MAX = 2000;
const EARLIEST = "1900-01-01";
const DAY = 24 * 60 * 60 * 1000;

export type EventProblem = "event-date" | "event-title";

export interface EventInput {
  happenedOn: string;
  title: string;
  body: string;
  visibility: "public" | "private";
}

/**
 * Reads a day written as YYYY-MM-DD. A chronology holds what happened and what is planned,
 * so the day may lie up to a year ahead, and not before 1900.
 */
export function parseDay(input: unknown, now: Date = new Date()): string | undefined {
  if (typeof input !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(input)) return undefined;
  const day = new Date(`${input}T00:00:00Z`);
  if (Number.isNaN(day.getTime()) || day.toISOString().slice(0, 10) !== input) return undefined;
  if (input < EARLIEST || day.getTime() > now.getTime() + 366 * DAY) return undefined;
  return input;
}

export function checkEvent(
  fields: { day: unknown; title: unknown; body: unknown; onlyMe: unknown },
  now: Date = new Date(),
): EventInput | { problem: EventProblem } {
  const happenedOn = parseDay(fields.day, now);
  if (!happenedOn) return { problem: "event-date" };
  const title = cleanText(fields.title, TITLE_MAX);
  if (!title) return { problem: "event-title" };
  return {
    happenedOn,
    title,
    body: cleanText(fields.body, BODY_MAX, true),
    visibility: fields.onlyMe ? "private" : "public",
  };
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;

/** An event id from a form field, or undefined when the field is empty or malformed. */
export function eventId(input: unknown): string | undefined {
  return typeof input === "string" && UUID.test(input) ? input : undefined;
}

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

/** "2026-11-14" as "14 November 2026". */
export function formatDay(day: string): string {
  const [year, month, date] = day.split("-").map(Number);
  return `${date} ${MONTHS[(month ?? 1) - 1]} ${year}`;
}
