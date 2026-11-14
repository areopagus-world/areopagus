import pg from "pg";

/** Clever Cloud injects POSTGRESQL_ADDON_URI; DATABASE_URL is used locally and elsewhere. */
export function databaseUrl(env: NodeJS.ProcessEnv = process.env): string | undefined {
  return env.DATABASE_URL ?? env.POSTGRESQL_ADDON_URI;
}

let pool: pg.Pool | undefined;

export function getPool(): pg.Pool {
  const url = databaseUrl();
  if (!url) throw new Error("No database configured: set DATABASE_URL");
  pool ??= new pg.Pool({ connectionString: url, max: 5, idleTimeoutMillis: 30_000 });
  return pool;
}
