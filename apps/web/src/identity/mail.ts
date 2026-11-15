import nodemailer from "nodemailer";
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
 * Sends the sign-in link. Without SMTP settings (local development) the link is printed to the log instead.
 */
export async function sendLoginLink(email: string, link: string): Promise<void> {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, MAIL_FROM } = process.env;
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS || !MAIL_FROM) {
    console.log(`[mail not configured] sign-in link for ${email}: ${link}`);
    return;
  }
  const port = Number(SMTP_PORT ?? 587);
  const transport = nodemailer.createTransport({
    host: SMTP_HOST,
    port,
    secure: port === 465,
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  });
  await transport.sendMail({
    from: MAIL_FROM,
    to: email,
    subject: "Your sign-in link for Areopagus",
    text: [
      "Open this link to sign in to Areopagus:",
      "",
      link,
      "",
      `It works once and for ${LOGIN_TOKEN_MINUTES} minutes.`,
      "If you did not ask for it, ignore this message: nothing happens without the link.",
    ].join("\n"),
  });
}
