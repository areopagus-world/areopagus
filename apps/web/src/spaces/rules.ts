/** Addresses the app itself uses, or may need later, cannot be taken as a space name. */
const RESERVED = new Set([
  "about",
  "admin",
  "api",
  "app",
  "areopagus",
  "auth",
  "beta",
  "blog",
  "build",
  "communities",
  "community",
  "contact",
  "court",
  "docs",
  "favicon",
  "help",
  "home",
  "legal",
  "login",
  "logout",
  "map",
  "moderation",
  "moderator",
  "me",
  "new",
  "places",
  "privacy",
  "public",
  "report",
  "reports",
  "robots",
  "search",
  "settings",
  "shop",
  "site",
  "sitemap",
  "skills",
  "space",
  "spaces",
  "static",
  "status",
  "support",
  "terms",
  "vote",
  "www",
  "de",
  "en",
  "es",
  "fr",
  "it",
  "nl",
  "pl",
  "pt",
  "ru",
  "uk",
]);

export const HANDLE_PATTERN = "[a-z0-9]([a-z0-9\\-]{1,28})[a-z0-9]";
const HANDLE = new RegExp(`^${HANDLE_PATTERN}$`);
/** What the form field accepts: capitals are allowed while typing and are lowered on save. */
export const HANDLE_FIELD_PATTERN = "[A-Za-z0-9]([A-Za-z0-9\\-]{1,28})[A-Za-z0-9]";

export type HandleProblem = "format" | "reserved";

/**
 * A handle is the address of a space: areopagus.world/<handle>.
 * 3 to 30 characters: Latin letters, digits and hyphens, not starting or ending with a hyphen.
 */
export function checkHandle(input: unknown): { handle: string } | { problem: HandleProblem } {
  const handle = typeof input === "string" ? input.trim().toLowerCase() : "";
  if (!HANDLE.test(handle) || handle.includes("--")) return { problem: "format" };
  if (RESERVED.has(handle)) return { problem: "reserved" };
  return { handle };
}

/** Trims, collapses inner whitespace runs on single-line fields, and cuts to a maximum length. */
export function cleanText(input: unknown, max: number, multiline = false): string {
  if (typeof input !== "string") return "";
  const text = multiline
    ? input
        .replace(/\r\n/g, "\n")
        .replace(/[ \t]+/g, " ")
        .replace(/\n{3,}/g, "\n\n")
    : input.replace(/\s+/g, " ");
  return text.trim().slice(0, max);
}

export const MAX_SKILLS = 12;

/** Skills arrive as one field, separated by commas or new lines. Duplicates are dropped, case ignored. */
export function parseSkills(input: unknown): string[] {
  if (typeof input !== "string") return [];
  const seen = new Set<string>();
  const skills: string[] = [];
  for (const raw of input.split(/[,\n]/)) {
    const skill = cleanText(raw, 40);
    const key = skill.toLowerCase();
    if (!skill || seen.has(key)) continue;
    seen.add(key);
    skills.push(skill);
    if (skills.length === MAX_SKILLS) break;
  }
  return skills;
}
