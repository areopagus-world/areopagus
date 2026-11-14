import { getPool } from "@/db/pool";
import {
  hashSecret,
  LOGIN_TOKEN_MINUTES,
  MAX_LINKS_PER_EMAIL,
  MAX_LINKS_PER_IP,
  newSecret,
  SESSION_DAYS,
} from "./tokens";

export interface User {
  id: string;
  email: string;
}

/**
 * Creates a one-time sign-in secret for the address, or returns undefined when the address
 * or the sender's network has asked for too many links recently.
 */
export async function createLoginToken(email: string, ip: string): Promise<string | undefined> {
  const pool = getPool();
  const ipHash = hashSecret(ip);
  await pool.query("delete from login_tokens where created_at < now() - interval '1 day'");
  const { rows } = await pool.query<{ by_email: string; by_ip: string }>(
    `select
       count(*) filter (where email = $1 and created_at > now() - make_interval(mins => $3)) as by_email,
       count(*) filter (where ip_hash = $2 and created_at > now() - interval '1 hour') as by_ip
     from login_tokens`,
    [email, ipHash, LOGIN_TOKEN_MINUTES],
  );
  if (
    Number(rows[0]?.by_email) >= MAX_LINKS_PER_EMAIL ||
    Number(rows[0]?.by_ip) >= MAX_LINKS_PER_IP
  ) {
    return undefined;
  }
  const { secret, hash } = newSecret();
  await pool.query(
    `insert into login_tokens (token_hash, email, ip_hash, expires_at)
     values ($1, $2, $3, now() + make_interval(mins => $4))`,
    [hash, email, ipHash, LOGIN_TOKEN_MINUTES],
  );
  return secret;
}

/**
 * Spends a sign-in secret. It works once and only before it expires.
 * Returns a new session secret, or undefined when the link is wrong, used or too old.
 */
export async function redeemLoginToken(secret: string): Promise<string | undefined> {
  const client = await getPool().connect();
  try {
    await client.query("begin");
    const spent = await client.query<{ email: string }>(
      `update login_tokens set used_at = now()
       where token_hash = $1 and used_at is null and expires_at > now()
       returning email`,
      [hashSecret(secret)],
    );
    const email = spent.rows[0]?.email;
    if (!email) {
      await client.query("rollback");
      return undefined;
    }
    const user = await client.query<{ id: string }>(
      `insert into users (email) values ($1)
       on conflict (email) do update set email = excluded.email
       returning id`,
      [email],
    );
    const session = newSecret();
    await client.query(
      `insert into sessions (token_hash, user_id, expires_at)
       values ($1, $2, now() + make_interval(days => $3))`,
      [session.hash, user.rows[0]?.id, SESSION_DAYS],
    );
    await client.query("commit");
    return session.secret;
  } catch (error) {
    await client.query("rollback");
    throw error;
  } finally {
    client.release();
  }
}

export async function findSessionUser(secret: string): Promise<User | undefined> {
  const { rows } = await getPool().query<User>(
    `select u.id, u.email from sessions s join users u on u.id = s.user_id
     where s.token_hash = $1 and s.expires_at > now()`,
    [hashSecret(secret)],
  );
  return rows[0];
}

export async function endSession(secret: string): Promise<void> {
  await getPool().query("delete from sessions where token_hash = $1", [hashSecret(secret)]);
}
