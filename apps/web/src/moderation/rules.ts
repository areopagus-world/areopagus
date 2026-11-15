import { cleanText } from "../spaces/rules";

export const REASONS = {
  illegal: "Illegal content",
  harassment: "Harassment or threats",
  scam: "Spam or scam",
  impersonation: "Pretends to be someone else",
  private: "Shows someone's private data",
  other: "Something else",
} as const;
export type Reason = keyof typeof REASONS;

export const DETAILS_MIN = 10;
export const DETAILS_MAX = 2000;
export const MAX_REPORTS_PER_DAY = 5;

export type ReportProblem = "reason" | "details" | "contact";

export interface ReportInput {
  reason: Reason;
  details: string;
  contact: string;
}

/** Checks what a reader wrote in the report form. The contact e-mail is optional. */
export function checkReport(fields: {
  reason: unknown;
  details: unknown;
  contact: unknown;
}): ReportInput | { problem: ReportProblem } {
  if (typeof fields.reason !== "string" || !Object.hasOwn(REASONS, fields.reason))
    return { problem: "reason" };
  const details = cleanText(fields.details, DETAILS_MAX, true);
  if (details.length < DETAILS_MIN) return { problem: "details" };
  const contact = cleanText(fields.contact, 120).toLowerCase();
  if (contact && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact)) return { problem: "contact" };
  return { reason: fields.reason as Reason, details, contact };
}

/** Moderators are named in MODERATOR_EMAILS. An empty list means there are none. */
export function isModerator(email: string, list: string | undefined): boolean {
  const wanted = email.trim().toLowerCase();
  return (list ?? "")
    .split(",")
    .map((entry) => entry.trim().toLowerCase())
    .filter(Boolean)
    .includes(wanted);
}

export function moderatorEmails(list: string | undefined): string[] {
  return (list ?? "")
    .split(",")
    .map((entry) => entry.trim().toLowerCase())
    .filter(Boolean);
}
