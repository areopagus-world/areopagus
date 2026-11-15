import { sendMail } from "@/identity/mail";
import { emailOfUser } from "./store";

/**
 * Tells one person by e-mail that something happened to a question. Never throws: the question or
 * answer is already saved, and a lost notice must not turn into an error for the person writing.
 */
export async function notify(userId: string, subject: string, lines: string[]): Promise<void> {
  try {
    const email = await emailOfUser(userId);
    if (!email) return;
    const sent = await sendMail(
      email,
      subject,
      [...lines, "", "You get this because you have a space on Areopagus."].join("\n"),
    );
    if (!sent) console.log(`[mail not configured] ${subject}`);
  } catch (error) {
    console.error("question notice not sent:", error instanceof Error ? error.message : error);
  }
}
