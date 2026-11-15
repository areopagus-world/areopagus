import nodemailer from "nodemailer";
import type { Locale } from "@/i18n/locales";
import { messagesFor } from "@/i18n/messages";
import { LOGIN_TOKEN_MINUTES } from "./tokens";

/** Sends a plain-text message. Returns false when SMTP is not configured. */
export async function sendMail(
  to: string | string[],
  subject: string,
  text: string,
): Promise<boolean> {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, MAIL_FROM } = process.env;
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS || !MAIL_FROM) return false;
  const port = Number(SMTP_PORT ?? 587);
  const transport = nodemailer.createTransport({
    host: SMTP_HOST,
    port,
    secure: port === 465,
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  });
  await transport.sendMail({ from: MAIL_FROM, to, subject, text });
  return true;
}

/**
 * Sends the sign-in link, in the language the person asked in. Without SMTP settings (local
 * development) the link is printed to the log instead.
 */
export async function sendLoginLink(email: string, link: string, locale: Locale): Promise<void> {
  const t = messagesFor(locale).mail;
  const text = [t.loginOpen, "", link, "", t.loginOnce(LOGIN_TOKEN_MINUTES), t.loginIgnore].join(
    "\n",
  );
  if (!(await sendMail(email, t.loginSubject, text))) {
    console.log(`[mail not configured] sign-in link for ${email}: ${link}`);
  }
}
