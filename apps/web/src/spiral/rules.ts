import { LEVELS, type Level } from "../snapshots/rules";
import { cleanText } from "../spaces/rules";

/** The longest name a person may give to one level of their spiral. */
export const SPIRAL_TITLE_MAX = 40;

/**
 * The name a reader sees for a level: the owner's own title when they gave one, otherwise the
 * spiral's name for it.
 */
export function levelTitle(
  levels: readonly { level: Level; title: string | null }[] | undefined,
  level: Level,
  names: readonly { name: string }[],
): string {
  const own = levels?.find((entry) => entry.level === level)?.title;
  return own ?? names[level - 1]?.name ?? String(level);
}

/**
 * The hues of the eight levels. The levels keep their colour words ("to become yellow"); the
 * shades are the station's own, from its river of light.
 */
export const LEVEL_COLORS: Record<Level, string> = {
  1: "#c9a97b",
  2: "#9b7fd1",
  3: "#e0533d",
  4: "#4f7fd9",
  5: "#e8913a",
  6: "#5fb37a",
  7: "#e3c547",
  8: "#49c2c0",
};

export interface SpiralInput {
  /** Whether others see the spiral on the capsule. Off until the owner turns it on. */
  public: boolean;
  /** The owner's own names for the levels; a level without a name keeps the spiral's name. */
  titles: Map<Level, string>;
}

/** Reads the spiral form: a checkbox "public" and fields "title_1" to "title_8". */
export function checkSpiral(fields: { get(name: string): unknown }): SpiralInput {
  const titles = new Map<Level, string>();
  for (const level of LEVELS) {
    const title = cleanText(fields.get(`title_${level}`), SPIRAL_TITLE_MAX);
    if (title) titles.set(level, title);
  }
  return { public: Boolean(fields.get("public")), titles };
}
