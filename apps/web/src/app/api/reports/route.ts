import { NextResponse } from "next/server";
import { clientIp, publicOrigin, sameOrigin } from "@/identity/config";
import { sendMail } from "@/identity/mail";
import { currentUser } from "@/identity/session";
import { hashSecret } from "@/identity/tokens";
import { checkReport, moderatorEmails, REASONS } from "@/moderation/rules";
import { fileReport } from "@/moderation/store";
import { targetFrom, targetQuery } from "@/moderation/target";

/** Takes a report from the form on /report. Open to everyone, signed in or not. */
export async function POST(request: Request) {
  if (!sameOrigin(request)) return new NextResponse(null, { status: 403 });
  const origin = publicOrigin(request);
  const form = await request.formData();
  const target = await targetFrom((name) => form.get(name));
  if (!target) return new NextResponse(null, { status: 404 });
  const back = (problem: string) =>
    NextResponse.redirect(
      new URL(`/report?${targetQuery(target)}&problem=${problem}`, origin),
      303,
    );

  const user = await currentUser();
  const checked = checkReport({
    reason: form.get("reason"),
    details: form.get("details"),
    contact: user ? user.email : form.get("contact"),
  });
  if ("problem" in checked) return back(checked.problem);
  const result = await fileReport(target, checked, user?.id, hashSecret(clientIp(request)));
  if (result === "limit") return back("limit");

  // Tell the moderators. A failed message must not lose the report, which is already stored.
  const moderators = moderatorEmails(process.env.MODERATOR_EMAILS);
  if (moderators.length > 0) {
    try {
      await sendMail(
        moderators,
        `Areopagus report: ${REASONS[checked.reason]}`,
        [
          `Reported: ${target.label}`,
          `${origin}${target.path}`,
          "",
          checked.details,
          "",
          `${origin}/moderation`,
        ].join("\n"),
      );
    } catch (error) {
      console.error("report notice not sent:", error instanceof Error ? error.message : error);
    }
  }
  return NextResponse.redirect(new URL("/report/sent", origin), 303);
}
