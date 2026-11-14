import { createHash, randomBytes } from "node:crypto";

export const LOGIN_TOKEN_MINUTES = 15;
export const SESSION_DAYS = 30;
export const MAX_LINKS_PER_EMAIL = 3;
export const MAX_LINKS_PER_IP = 10;

/** SHA-256 in hex. Secrets are stored only in this form, so a leaked table cannot be replayed. */
export function hashSecret(secret: string): string {
  return createHash("sha256").update(secret).digest("hex");
}

/** A fresh 256-bit secret and the hash to store for it. */
export function newSecret(): { secret: string; hash: string } {
  const secret = randomBytes(32).toString("base64url");
  return { secret, hash: hashSecret(secret) };
}

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/** Trims and lower-cases an address; returns undefined when it cannot be an e-mail address. */
export function normalizeEmail(input: unknown): string | undefined {
  if (typeof input !== "string") return undefined;
  const email = input.trim().toLowerCase();
  return email.length <= 254 && EMAIL.test(email) ? email : undefined;
}

/**
 * While sign-in is open to the first circle only, the allowlist names who may receive a link.
 * An empty or missing list means everyone may.
 */
export function isAllowed(email: string, allowlist: string | undefined): boolean {
  const allowed = (allowlist ?? "")
    .split(",")
    .map((entry) => entry.trim().toLowerCase())
    .filter(Boolean);
  return allowed.length === 0 || allowed.includes(email);
}
