/** Languages of the interface. The data model is multilingual on its own: this is only the interface. */
export const LOCALES = ["en", "fr", "ru"] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = "en";
export const LOCALE_COOKIE = "lang";
export const LOCALE_NAMES: Record<Locale, string> = {
  en: "English",
  fr: "Français",
  ru: "Русский",
};

export function isLocale(value: unknown): value is Locale {
  return typeof value === "string" && (LOCALES as readonly string[]).includes(value);
}

/**
 * The language to answer in: the one the person chose (cookie), otherwise the best one their
 * browser asks for, otherwise English.
 */
export function pickLocale(
  cookie: string | undefined,
  acceptLanguage: string | null | undefined,
): Locale {
  if (isLocale(cookie)) return cookie;
  const wanted = (acceptLanguage ?? "")
    .split(",")
    .map((part, index) => {
      const [tag = "", ...params] = part.trim().split(";");
      const q = params.map((p) => p.trim()).find((p) => p.startsWith("q="));
      return { lang: tag.toLowerCase().split("-")[0] ?? "", q: q ? Number(q.slice(2)) : 1, index };
    })
    .filter((entry) => entry.lang && entry.q > 0)
    .sort((a, b) => b.q - a.q || a.index - b.index);
  return wanted.map((entry) => entry.lang).find(isLocale) ?? DEFAULT_LOCALE;
}

/** Where to go after switching language: a path on this site, never another site. */
export function safeNext(next: unknown): string | undefined {
  if (
    typeof next !== "string" ||
    !next.startsWith("/") ||
    next.startsWith("//") ||
    next.includes("\\")
  ) {
    return undefined;
  }
  return next.slice(0, 500);
}

/** "2026-11-14" as a day in words, in the given language. */
export function formatDay(day: string, locale: Locale): string {
  const date = new Date(`${day}T00:00:00Z`);
  if (Number.isNaN(date.getTime())) return day;
  // British English, for the European order of day and month.
  const tag = locale === "en" ? "en-GB" : locale;
  return new Intl.DateTimeFormat(tag, {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}

/** Russian needs three plural forms: 1 участник, 2 участника, 5 участников. */
export function ruPlural(n: number, one: string, few: string, many: string): string {
  const tens = n % 100;
  const units = n % 10;
  if (tens >= 11 && tens <= 14) return many;
  if (units === 1) return one;
  if (units >= 2 && units <= 4) return few;
  return many;
}
