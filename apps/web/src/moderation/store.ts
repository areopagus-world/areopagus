import { getPool } from "@/db/pool";
import { MAX_REPORTS_PER_DAY, type ReportInput } from "./rules";

export type TargetKind = "space" | "community" | "event";

export interface Target {
  kind: TargetKind;
  id: string;
  /** What the reader sees it called. */
  label: string;
  /** Where it lives on the site. */
  path: string;
}

const TABLE: Record<TargetKind, string> = {
  space: "spaces",
  community: "communities",
  event: "events",
};

/** Finds what is being reported, as long as it is publicly visible. */
export async function findTarget(kind: TargetKind, key: string): Promise<Target | undefined> {
  const pool = getPool();
  if (kind === "event") {
    const { rows } = await pool.query<{ id: string; title: string; owner: string }>(
      `select e.id, e.title, coalesce(s.handle::text, c.handle::text) as owner
       from events e
       left join spaces s on s.id = e.space_id
       left join communities c on c.id = e.community_id
       where e.id = $1 and e.visibility = 'public' and e.hidden_at is null`,
      [key],
    );
    const event = rows[0];
    return event
      ? { kind, id: event.id, label: event.title, path: `/${event.owner}#e-${event.id}` }
      : undefined;
  }
  const { rows } = await pool.query<{ id: string; name: string; handle: string }>(
    `select id, name, handle::text from ${TABLE[kind]} where handle = $1 and hidden_at is null`,
    [key],
  );
  const found = rows[0];
  return found ? { kind, id: found.id, label: found.name, path: `/${found.handle}` } : undefined;
}

/** Records a report. Returns "limit" when this reader has sent too many today. */
export async function fileReport(
  target: Target,
  input: ReportInput,
  reporterId: string | undefined,
  ipHash: string,
): Promise<"filed" | "limit"> {
  const pool = getPool();
  const { rows } = await pool.query<{ n: number }>(
    "select count(*)::int as n from reports where ip_hash = $1 and created_at > now() - interval '1 day'",
    [ipHash],
  );
  if ((rows[0]?.n ?? 0) >= MAX_REPORTS_PER_DAY) return "limit";
  await pool.query(
    `insert into reports (kind, target_id, label, path, reason, details, reporter_id, contact, ip_hash)
     values ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
    [
      target.kind,
      target.id,
      target.label,
      target.path,
      input.reason,
      input.details,
      reporterId ?? null,
      input.contact,
      ipHash,
    ],
  );
  return "filed";
}

export interface Report {
  id: string;
  kind: TargetKind;
  label: string;
  path: string;
  reason: string;
  details: string;
  contact: string;
  status: "open" | "kept" | "hidden" | "restored";
  note: string;
  createdAt: string;
}

export async function listReports(): Promise<Report[]> {
  const { rows } = await getPool().query<Report>(
    `select id, kind, label, path, reason, details, contact, status, note,
            to_char(created_at, 'YYYY-MM-DD HH24:MI') as "createdAt"
     from reports
     order by (status = 'open') desc, created_at desc
     limit 100`,
  );
  return rows;
}

/**
 * The moderator's decision on a report.
 * keep: the content stays. hide: it leaves public view and its owner sees the note. restore: it comes back.
 */
export async function decide(
  reportId: string,
  moderatorId: string,
  action: "keep" | "hide" | "restore",
  note: string,
): Promise<boolean> {
  const client = await getPool().connect();
  try {
    await client.query("begin");
    const { rows } = await client.query<{ kind: TargetKind; target_id: string; status: string }>(
      "select kind, target_id, status from reports where id = $1 for update",
      [reportId],
    );
    const report = rows[0];
    const allowed =
      report && (action === "restore" ? report.status === "hidden" : report.status === "open");
    if (!report || !allowed) {
      await client.query("rollback");
      return false;
    }
    if (action === "hide") {
      await client.query(
        `update ${TABLE[report.kind]} set hidden_at = now(), hidden_note = $2 where id = $1`,
        [report.target_id, note],
      );
    }
    if (action === "restore") {
      await client.query(
        `update ${TABLE[report.kind]} set hidden_at = null, hidden_note = null where id = $1`,
        [report.target_id],
      );
    }
    const status = action === "keep" ? "kept" : action === "hide" ? "hidden" : "restored";
    await client.query(
      "update reports set status = $2, note = $3, decided_by = $4, decided_at = now() where id = $1",
      [reportId, status, note, moderatorId],
    );
    await client.query("commit");
    return true;
  } catch (error) {
    await client.query("rollback");
    throw error;
  } finally {
    client.release();
  }
}
