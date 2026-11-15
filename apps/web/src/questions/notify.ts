import { sendMail } from "@/identity/mail";
import { recipient } from "@/identity/settings";
import { messagesFor, type Messages } from "@/i18n/messages";

/**
 * Tells one person by e-mail that something happened to a question, in their language, unless they
 * turned such e-mails off. Never throws: the question or answer is already saved, and a lost notice
 * must not turn into an error for the person writing.
 */
export async function notify(
  userId: string,
  origin: string,
  write: (t: Messages) => { subject: string; lines: string[] },
): Promise<void> {
  try {
    const to = await recipient(userId);
    if (!to?.notify) return;
    const t = messagesFor(to.lang);
    const { subject, lines } = write(t);
    const sent = await sendMail(
      to.email,
      subject,
      [...lines, "", t.mail.footer(`${origin}/me#settings`)].join("\n"),
    );
    if (!sent) console.log(`[mail not configured] ${subject}`);
  } catch (error) {
    console.error("question notice not sent:", error instanceof Error ? error.message : error);
  }
}
