import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { currentUser } from "@/identity/session";
import { DETAILS_MAX, DETAILS_MIN, REASONS } from "@/moderation/rules";
import { targetFrom, targetKey } from "@/moderation/target";
import { button, field, Screen } from "../ui";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Report · Areopagus", robots: { index: false } };

const PROBLEMS: Record<string, string> = {
  reason: "Choose what is wrong.",
  details: `Describe the problem in at least ${DETAILS_MIN} characters, so a person can check it.`,
  contact: "That does not look like an e-mail address. Leave the field empty if you prefer.",
  limit: "You have sent several reports today. Try again tomorrow.",
};
const hint = { color: "#a39b8f", fontSize: 15, margin: "-8px 0 16px" } as const;

/** Anyone can report a space, a community or an event. A person reads every report. */
export default async function ReportPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const params = await searchParams;
  const target = await targetFrom((name) => params[name]);
  if (!target) notFound();
  const user = await currentUser();
  const problem = params.problem;
  return (
    <Screen title="Report">
      <p>
        You are reporting <a href={target.path}>{target.label}</a>. A person reads every report and
        decides; the decision and its reason are recorded.
      </p>
      {problem && PROBLEMS[problem] ? (
        <p style={{ color: "#ff4a1c" }}>{PROBLEMS[problem]}</p>
      ) : null}
      <form method="post" action="/api/reports">
        <input type="hidden" name={target.kind} value={targetKey(target)} />
        <label>
          What is wrong
          <select style={field} name="reason" defaultValue="" required>
            <option value="" disabled>
              Choose
            </option>
            {Object.entries(REASONS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>
        <label>
          What exactly
          <textarea
            style={{ ...field, minHeight: 150 }}
            name="details"
            minLength={DETAILS_MIN}
            maxLength={DETAILS_MAX}
            required
          />
        </label>
        <p style={hint}>
          For illegal content, say which law or right you believe it breaks, if you know.
        </p>
        {user ? null : (
          <>
            <label>
              Your e-mail, if you want an answer
              <input
                style={field}
                type="email"
                name="contact"
                maxLength={120}
                autoComplete="email"
              />
            </label>
            <p style={hint}>Used only to answer this report.</p>
          </>
        )}
        <button style={button} type="submit">
          Send the report
        </button>
      </form>
    </Screen>
  );
}
