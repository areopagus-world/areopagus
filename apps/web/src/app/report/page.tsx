import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { currentUser } from "@/identity/session";
import { getT } from "@/i18n/server";
import { DETAILS_MAX, DETAILS_MIN, REASONS } from "@/moderation/rules";
import { targetFrom, targetKey } from "@/moderation/target";
import { button, field, Screen } from "../ui";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getT();
  return { title: `${t.report.title} · ${t.brand}`, robots: { index: false } };
}

const hint = { color: "#a39b8f", fontSize: 15, margin: "-8px 0 16px" } as const;

/** Anyone can report a space, a community, an event, a question or an answer. A person reads every report. */
export default async function ReportPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const [params, { t }] = await Promise.all([searchParams, getT()]);
  const target = await targetFrom((name) => params[name]);
  if (!target) notFound();
  const user = await currentUser();
  const problems: Record<string, string> = {
    reason: t.report.problemReason,
    details: t.report.problemDetails(DETAILS_MIN),
    contact: t.report.problemContact,
    limit: t.report.problemLimit,
  };
  const problem = params.problem;
  return (
    <Screen title={t.report.title}>
      <p>
        {t.report.youReport} <a href={target.path}>{target.label}</a>. {t.report.howItWorks}
      </p>
      {problem && problems[problem] ? (
        <p style={{ color: "#ff4a1c" }}>{problems[problem]}</p>
      ) : null}
      <form method="post" action="/api/reports">
        <input type="hidden" name={target.kind} value={targetKey(target)} />
        <label>
          {t.report.whatWrong}
          <select style={field} name="reason" defaultValue="" required>
            <option value="" disabled>
              {t.report.choose}
            </option>
            {(Object.keys(REASONS) as (keyof typeof REASONS)[]).map((value) => (
              <option key={value} value={value}>
                {t.report.reasons[value]}
              </option>
            ))}
          </select>
        </label>
        <label>
          {t.report.whatExactly}
          <textarea
            style={{ ...field, minHeight: 150 }}
            name="details"
            minLength={DETAILS_MIN}
            maxLength={DETAILS_MAX}
            required
          />
        </label>
        <p style={hint}>{t.report.detailsHint}</p>
        {user ? null : (
          <>
            <label>
              {t.report.yourEmail}
              <input
                style={field}
                type="email"
                name="contact"
                maxLength={120}
                autoComplete="email"
              />
            </label>
            <p style={hint}>{t.report.emailHint}</p>
          </>
        )}
        <button style={button} type="submit">
          {t.report.send}
        </button>
      </form>
    </Screen>
  );
}
