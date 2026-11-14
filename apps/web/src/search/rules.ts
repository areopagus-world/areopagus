export const QUERY_MAX = 60;

/** Trims a search phrase and collapses spaces. Undefined when there is nothing to search for. */
export function cleanQuery(input: unknown): string | undefined {
  if (typeof input !== "string") return undefined;
  const text = input.replace(/\s+/g, " ").trim().slice(0, QUERY_MAX);
  return text.length >= 2 ? text : undefined;
}

/** Turns a phrase into a pattern that matches it anywhere, with the wildcards of LIKE taken literally. */
export function likePattern(query: string): string {
  return `%${query.toLowerCase().replace(/[\\%_]/g, (c) => `\\${c}`)}%`;
}
