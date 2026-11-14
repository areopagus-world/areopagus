import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { currentUser } from "@/identity/session";
import { isModerator, REASONS, type Reason } from "@/moderation/rules";
import { listReports } from "@/moderation/store";
import { button, field, Screen } from "../ui";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Moderation · Areopagus", robots: { index: false } };

const mute = { color: "#a39b8f", fontSize: 15 } as const;
const quiet = { ...button, background: "transparent", color: "#f3efe6" } as const;
const STATUS = { open: "Open", kept: "Kept", hidden: "Hidden", restored: "Restored" } as const;

/** The moderators' queue. Everyone else gets "not found". */
export default async function Moderation() {
  const user = await currentUser();
  if (!user || !isModerator(user.email, process.env.MODERATOR_EMAILS)) notFound();
  const reports = await listReports();
  const open = reports.filter((report) => report.status === "open").length;
  return (
    <Screen title="Moderation">
      <p style={mute}>
        {open === 0 ? "No open reports." : `${open} open.`} Every decision needs a reason: the owner
        of hidden content sees it.
      </p>
      <ul style={{ listStyle: "none", padding: 0, margin: "20px 0 0" }}>
        {reports.map((report) => (
          <li key={report.id} style={{ padding: "22px 0", borderTop: "1px solid #3a342e" }}>
            <p style={{ ...mute, margin: 0 }}>
              {report.createdAt} · {report.kind} · {STATUS[report.status]}
            </p>
            <p style={{ fontSize: 20, fontWeight: 600, margin: "4px 0" }}>
              <a href={report.path}>{report.label}</a>
            </p>
            <p style={{ margin: "4px 0" }}>{REASONS[report.reason as Reason] ?? report.reason}</p>
            <p style={{ whiteSpace: "pre-wrap", margin: "8px 0" }}>{report.details}</p>
            {report.contact ? <p style={mute}>Answer to: {report.contact}</p> : null}
            {report.status === "open" ? (
              <form method="post" action="/api/moderation" style={{ marginTop: 12 }}>
                <input type="hidden" name="id" value={report.id} />
                <label>
                  Reason for the decision
                  <textarea
                    style={{ ...field, minHeight: 70 }}
                    name="note"
                    maxLength={500}
                    required
                  />
                </label>
                <button style={button} type="submit" name="action" value="hide">
                  Hide the content
                </button>{" "}
                <button style={quiet} type="submit" name="action" value="keep">
                  Keep it
                </button>
              </form>
            ) : (
              <>
                <p style={mute}>Decision: {report.note}</p>
                {report.status === "hidden" ? (
                  <form method="post" action="/api/moderation">
                    <input type="hidden" name="id" value={report.id} />
                    <input type="hidden" name="note" value="Restored after review." />
                    <button style={quiet} type="submit" name="action" value="restore">
                      Restore
                    </button>
                  </form>
                ) : null}
              </>
            )}
          </li>
        ))}
      </ul>
    </Screen>
  );
}
