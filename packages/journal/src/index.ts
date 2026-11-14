/**
 * Append-only journal with a hash chain.
 *
 * Every record carries the hash of the record before it, so a past record cannot be
 * changed or removed without breaking every hash after it. The journal is used for
 * money, votes and administrator actions. The head hash is published daily outside
 * the platform, which makes a rewrite of history detectable by anyone.
 *
 * This package holds the pure logic only. Storage lives in the module that owns the
 * journal table; it must append inside a transaction that locks the current head.
 */
import { createHash } from "node:crypto";

export type JsonValue =
  string | number | boolean | null | JsonValue[] | { [key: string]: JsonValue };

export interface JournalEntry {
  /** What happened, e.g. "vote.cast" or "admin.space.suspended". */
  readonly kind: string;
  /** ISO 8601 timestamp in UTC. */
  readonly at: string;
  readonly payload: JsonValue;
}

export interface JournalRecord extends JournalEntry {
  /** Position in the chain, starting at 0. */
  readonly seq: number;
  /** Hash of the previous record, or GENESIS_HASH for the first one. */
  readonly prevHash: string;
  /** SHA-256 over seq, prevHash, kind, at and payload. */
  readonly hash: string;
}

export const GENESIS_HASH = "0".repeat(64);

export type VerifyResult =
  | { readonly ok: true; readonly head: string }
  | { readonly ok: false; readonly seq: number; readonly reason: VerifyFailure };

export type VerifyFailure = "bad-seq" | "bad-prev-hash" | "bad-hash";

/**
 * Serialises a value with object keys sorted, so the same data always produces the
 * same bytes regardless of the order in which keys were written.
 */
export function canonicalJson(value: JsonValue): string {
  if (value === null || typeof value !== "object") {
    if (typeof value === "number" && !Number.isFinite(value)) {
      throw new TypeError("Journal payloads cannot contain NaN or Infinity");
    }
    return JSON.stringify(value);
  }
  if (Array.isArray(value)) {
    return `[${value.map(canonicalJson).join(",")}]`;
  }
  const members = Object.keys(value)
    .sort()
    .map((key) => `${JSON.stringify(key)}:${canonicalJson(value[key] as JsonValue)}`);
  return `{${members.join(",")}}`;
}

function hashRecord(seq: number, prevHash: string, entry: JournalEntry): string {
  const body = canonicalJson({
    seq,
    prevHash,
    kind: entry.kind,
    at: entry.at,
    payload: entry.payload,
  });
  return createHash("sha256").update(body, "utf8").digest("hex");
}

/** Builds the record that follows `previous`. Pass `undefined` for the first record. */
export function append(previous: JournalRecord | undefined, entry: JournalEntry): JournalRecord {
  const seq = previous === undefined ? 0 : previous.seq + 1;
  const prevHash = previous === undefined ? GENESIS_HASH : previous.hash;
  return {
    seq,
    prevHash,
    kind: entry.kind,
    at: entry.at,
    payload: entry.payload,
    hash: hashRecord(seq, prevHash, entry),
  };
}

/**
 * Checks a whole chain from the first record. Returns the head hash on success, or
 * the position and reason of the first broken record.
 */
export function verify(records: readonly JournalRecord[]): VerifyResult {
  let prevHash = GENESIS_HASH;
  for (const [index, record] of records.entries()) {
    if (record.seq !== index) {
      return { ok: false, seq: index, reason: "bad-seq" };
    }
    if (record.prevHash !== prevHash) {
      return { ok: false, seq: index, reason: "bad-prev-hash" };
    }
    if (record.hash !== hashRecord(record.seq, record.prevHash, record)) {
      return { ok: false, seq: index, reason: "bad-hash" };
    }
    prevHash = record.hash;
  }
  return { ok: true, head: prevHash };
}
