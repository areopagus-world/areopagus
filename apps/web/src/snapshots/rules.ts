/**
 * Snapshots of reality. A person places one level of a place on a scale from shortage (-100)
 * through balance (0) to excess (+100). The network shows only summaries, never one person's view.
 */

export const LEVELS = [1, 2, 3, 4, 5, 6, 7, 8] as const;
export type Level = (typeof LEVELS)[number];

export const SCALE_MIN = -100;
export const SCALE_MAX = 100;
export const SCALE_STEP = 10;

/** A newer snapshot of the same level of the same place within this many days replaces the older one. */
export const REPLACE_DAYS = 30;
/** A summary opens only once this many people have made a snapshot, so no one's view stands out. */
export const SUMMARY_MIN = 10;
/** Older snapshots count less: their weight halves every this many days. */
export const HALF_LIFE_DAYS = 365;
export const MAX_SNAPSHOTS_PER_DAY = 40;
/** A middle closer to zero than this reads as balance. */
export const BALANCE_BAND = 20;

export function checkLevel(input: unknown): Level | undefined {
  const n = typeof input === "string" && /^[1-8]$/.test(input) ? Number(input) : NaN;
  return (LEVELS as readonly number[]).includes(n) ? (n as Level) : undefined;
}

/** A point on the scale: a whole step between the two ends. */
export function checkValue(input: unknown): number | undefined {
  if (typeof input !== "string" || !/^-?\d{1,3}$/.test(input.trim())) return undefined;
  const n = Number(input.trim());
  if (n < SCALE_MIN || n > SCALE_MAX || n % SCALE_STEP !== 0) return undefined;
  return n === 0 ? 0 : n;
}

export function weight(ageDays: number): number {
  return 0.5 ** (Math.max(0, ageDays) / HALF_LIFE_DAYS);
}

/** One person's latest view of one level, and how old it is. */
export interface Reading {
  value: number;
  ageDays: number;
}

export interface Summary {
  count: number;
  /** The weighted middle of the views. */
  median: number;
  /** The middle half of the views lies between low and high. */
  low: number;
  high: number;
}

/** The value below which the share q of the total weight lies. */
export function weightedQuantile(points: { value: number; weight: number }[], q: number): number {
  const sorted = [...points].sort((a, b) => a.value - b.value);
  const total = sorted.reduce((sum, p) => sum + p.weight, 0);
  let seen = 0;
  for (const p of sorted) {
    seen += p.weight;
    if (seen >= q * total - 1e-9) return p.value;
  }
  return sorted[sorted.length - 1]?.value ?? 0;
}

/** A summary of the views, or only their number while there are too few to show. */
export function summarize(readings: Reading[]): Summary | { count: number } {
  const count = readings.length;
  if (count < SUMMARY_MIN) return { count };
  const points = readings.map((r) => ({ value: r.value, weight: weight(r.ageDays) }));
  return {
    count,
    median: weightedQuantile(points, 0.5),
    low: weightedQuantile(points, 0.25),
    high: weightedQuantile(points, 0.75),
  };
}

export type Lean = "short" | "balance" | "excess";

export function lean(median: number): Lean {
  if (median < -BALANCE_BAND) return "short";
  if (median > BALANCE_BAND) return "excess";
  return "balance";
}

/** A point on the scale as people read it: +30, 0, −30 (with a true minus sign). */
export function signed(n: number): string {
  if (n > 0) return `+${n}`;
  if (n < 0) return `−${Math.abs(n)}`;
  return "0";
}

/** Where a point lies along the bar, from 0% at shortage to 100% at excess. */
export function position(value: number): number {
  return ((value - SCALE_MIN) / (SCALE_MAX - SCALE_MIN)) * 100;
}
