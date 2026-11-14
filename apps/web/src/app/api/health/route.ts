import { NextResponse } from "next/server";
import { databaseUrl, getPool } from "@/db/pool";

export const dynamic = "force-dynamic";

/** Used by the deploy smoke check: 200 only when the app and its database both answer. */
export async function GET() {
  if (!databaseUrl()) {
    return NextResponse.json({ ok: false, db: "not configured" }, { status: 503 });
  }
  try {
    const { rows } = await getPool().query<{ migrations: string }>(
      "select count(*)::text as migrations from schema_migrations",
    );
    return NextResponse.json({
      ok: true,
      db: "up",
      migrations: Number(rows[0]?.migrations ?? 0),
      // Lets the deploy check confirm that the new build, not the previous one, is answering.
      commit: process.env.CC_COMMIT_ID ?? process.env.COMMIT_ID ?? null,
    });
  } catch {
    return NextResponse.json({ ok: false, db: "down" }, { status: 503 });
  }
}
