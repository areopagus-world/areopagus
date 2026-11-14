import { describe, expect, it } from "vitest";
import {
  GENESIS_HASH,
  append,
  canonicalJson,
  verify,
  type JournalEntry,
  type JournalRecord,
} from "./index.js";

const entry = (kind: string, payload: JournalEntry["payload"]): JournalEntry => ({
  kind,
  at: "2026-11-14T06:00:00.000Z",
  payload,
});

function chainOf(entries: JournalEntry[]): JournalRecord[] {
  const records: JournalRecord[] = [];
  for (const item of entries) {
    records.push(append(records.at(-1), item));
  }
  return records;
}

describe("canonicalJson", () => {
  it("sorts object keys at every depth", () => {
    expect(canonicalJson({ b: 1, a: { d: 2, c: [3, { f: 4, e: 5 }] } })).toBe(
      '{"a":{"c":[3,{"e":5,"f":4}],"d":2},"b":1}',
    );
  });

  it("keeps array order", () => {
    expect(canonicalJson([3, 1, 2])).toBe("[3,1,2]");
  });

  it("rejects numbers that JSON cannot represent", () => {
    expect(() => canonicalJson(Number.NaN)).toThrow(TypeError);
    expect(() => canonicalJson({ amount: Number.POSITIVE_INFINITY })).toThrow(TypeError);
  });
});

describe("append", () => {
  it("starts the chain at seq 0 with the genesis hash", () => {
    const first = append(undefined, entry("vote.cast", { ballot: "b1" }));
    expect(first.seq).toBe(0);
    expect(first.prevHash).toBe(GENESIS_HASH);
    expect(first.hash).toMatch(/^[0-9a-f]{64}$/);
  });

  it("links each record to the one before it", () => {
    const [first, second] = chainOf([entry("a", 1), entry("b", 2)]);
    expect(second?.seq).toBe(1);
    expect(second?.prevHash).toBe(first?.hash);
  });

  it("gives the same hash for the same payload written in a different key order", () => {
    const one = append(undefined, entry("payout", { to: "space-1", cents: 500 }));
    const two = append(undefined, entry("payout", { cents: 500, to: "space-1" }));
    expect(one.hash).toBe(two.hash);
  });
});

describe("verify", () => {
  const chain = chainOf([
    entry("vote.opened", { id: "v1" }),
    entry("vote.cast", { id: "v1", ballot: "b1" }),
    entry("vote.closed", { id: "v1" }),
  ]);

  it("accepts an empty chain", () => {
    expect(verify([])).toEqual({ ok: true, head: GENESIS_HASH });
  });

  it("accepts an untouched chain and returns its head", () => {
    expect(verify(chain)).toEqual({ ok: true, head: chain.at(-1)?.hash });
  });

  it("detects a changed payload", () => {
    const tampered = chain.map((record) =>
      record.seq === 1 ? { ...record, payload: { id: "v1", ballot: "b2" } } : record,
    );
    expect(verify(tampered)).toEqual({ ok: false, seq: 1, reason: "bad-hash" });
  });

  it("detects a removed record", () => {
    const withGap = [chain[0], chain[2]].filter((r): r is JournalRecord => r !== undefined);
    expect(verify(withGap)).toEqual({ ok: false, seq: 1, reason: "bad-seq" });
  });

  it("detects a record rewritten together with its own hash", () => {
    const first = chain[0];
    if (first === undefined) throw new Error("fixture is empty");
    const forged = append(undefined, entry("vote.opened", { id: "forged" }));
    expect(verify([forged, ...chain.slice(1)])).toEqual({
      ok: false,
      seq: 1,
      reason: "bad-prev-hash",
    });
    expect(forged.hash).not.toBe(first.hash);
  });
});
