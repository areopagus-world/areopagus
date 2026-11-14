import {
  generateAuthenticationOptions,
  generateRegistrationOptions,
  verifyAuthenticationResponse,
  verifyRegistrationResponse,
  type AuthenticationResponseJSON,
  type RegistrationResponseJSON,
} from "@simplewebauthn/server";
import { getPool } from "@/db/pool";
import { relyingPartyId } from "./relying-party";
import type { User } from "./store";
import { hashSecret, isAllowed, newSecret, SESSION_DAYS } from "./tokens";

export const CHALLENGE_COOKIE =
  process.env.NODE_ENV === "production" ? "__Host-webauthn" : "webauthn";
export const CHALLENGE_MINUTES = 5;
export const MAX_PASSKEYS = 10;
const RP_NAME = "Areopagus";

async function saveChallenge(challenge: string, userId: string | null): Promise<string> {
  const pool = getPool();
  await pool.query("delete from webauthn_challenges where expires_at < now()");
  const { secret, hash } = newSecret();
  await pool.query(
    `insert into webauthn_challenges (id_hash, challenge, user_id, expires_at)
     values ($1, $2, $3, now() + make_interval(mins => $4))`,
    [hash, challenge, userId, CHALLENGE_MINUTES],
  );
  return secret;
}

/** A challenge works once: reading it removes it. */
async function takeChallenge(
  secret: string,
): Promise<{ challenge: string; userId: string | null } | undefined> {
  const { rows } = await getPool().query<{ challenge: string; user_id: string | null }>(
    "delete from webauthn_challenges where id_hash = $1 and expires_at > now() returning challenge, user_id",
    [hashSecret(secret)],
  );
  return rows[0] ? { challenge: rows[0].challenge, userId: rows[0].user_id } : undefined;
}

export async function countPasskeys(userId: string): Promise<number> {
  const { rows } = await getPool().query<{ n: number }>(
    "select count(*)::int as n from passkeys where user_id = $1",
    [userId],
  );
  return rows[0]?.n ?? 0;
}

/** First half of adding a passkey: what the browser needs, and the secret that ties the answer to it. */
export async function startRegistration(user: User, origin: string) {
  const { rows } = await getPool().query<{ id: string; transports: string[] }>(
    "select id, transports from passkeys where user_id = $1",
    [user.id],
  );
  const options = await generateRegistrationOptions({
    rpName: RP_NAME,
    rpID: relyingPartyId(origin),
    userName: user.email,
    userID: new TextEncoder().encode(user.id),
    attestationType: "none",
    excludeCredentials: rows.map((row) => ({
      id: row.id,
      transports: row.transports,
    })),
    authenticatorSelection: { residentKey: "required", userVerification: "preferred" },
  });
  return { options, secret: await saveChallenge(options.challenge, user.id) };
}

export async function finishRegistration(
  user: User,
  secret: string,
  response: RegistrationResponseJSON,
  origin: string,
): Promise<boolean> {
  const stored = await takeChallenge(secret);
  if (!stored || stored.userId !== user.id) return false;
  if ((await countPasskeys(user.id)) >= MAX_PASSKEYS) return false;
  let verification;
  try {
    verification = await verifyRegistrationResponse({
      response,
      expectedChallenge: stored.challenge,
      expectedOrigin: origin,
      expectedRPID: relyingPartyId(origin),
      requireUserVerification: false,
    });
  } catch {
    return false;
  }
  if (!verification.verified) return false;
  const { credential, credentialDeviceType, credentialBackedUp } = verification.registrationInfo;
  const saved = await getPool().query(
    `insert into passkeys (id, user_id, public_key, counter, transports, device_type, backed_up)
     values ($1, $2, $3, $4, $5, $6, $7)
     on conflict (id) do nothing`,
    [
      credential.id,
      user.id,
      Buffer.from(credential.publicKey),
      credential.counter,
      credential.transports ?? [],
      credentialDeviceType,
      credentialBackedUp,
    ],
  );
  return saved.rowCount === 1;
}

/** First half of signing in: the browser offers whichever passkeys it holds for this domain. */
export async function startAuthentication(origin: string) {
  const options = await generateAuthenticationOptions({
    rpID: relyingPartyId(origin),
    userVerification: "preferred",
  });
  return { options, secret: await saveChallenge(options.challenge, null) };
}

/** Second half of signing in. Returns a new session secret, or undefined when anything does not match. */
export async function finishAuthentication(
  secret: string,
  response: AuthenticationResponseJSON,
  origin: string,
): Promise<string | undefined> {
  const stored = await takeChallenge(secret);
  if (!stored || typeof response?.id !== "string") return undefined;
  const pool = getPool();
  const { rows } = await pool.query<{
    id: string;
    user_id: string;
    public_key: Buffer;
    counter: string;
    transports: string[];
    email: string;
  }>(
    `select p.id, p.user_id, p.public_key, p.counter, p.transports, u.email
     from passkeys p join users u on u.id = p.user_id where p.id = $1`,
    [response.id],
  );
  const passkey = rows[0];
  if (!passkey || !isAllowed(passkey.email, process.env.AUTH_ALLOWED_EMAILS)) return undefined;
  let verification;
  try {
    verification = await verifyAuthenticationResponse({
      response,
      expectedChallenge: stored.challenge,
      expectedOrigin: origin,
      expectedRPID: relyingPartyId(origin),
      requireUserVerification: false,
      credential: {
        id: passkey.id,
        publicKey: new Uint8Array(passkey.public_key),
        counter: Number(passkey.counter),
        transports: passkey.transports,
      },
    });
  } catch {
    return undefined;
  }
  if (!verification.verified) return undefined;
  await pool.query("update passkeys set counter = $2, last_used_at = now() where id = $1", [
    passkey.id,
    verification.authenticationInfo.newCounter,
  ]);
  const session = newSecret();
  await pool.query(
    "insert into sessions (token_hash, user_id, expires_at) values ($1, $2, now() + make_interval(days => $3))",
    [session.hash, passkey.user_id, SESSION_DAYS],
  );
  return session.secret;
}
