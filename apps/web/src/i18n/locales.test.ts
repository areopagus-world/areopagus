import { describe, expect, it } from "vitest";
import { formatDay, pickLocale, ruPlural, safeNext } from "./locales";

describe("pickLocale", () => {
  it("follows the person's choice first", () => {
    expect(pickLocale("ru", "fr-FR,fr;q=0.9")).toBe("ru");
  });

  it("then the browser, by preference", () => {
    expect(pickLocale(undefined, "fr-FR,fr;q=0.9,en;q=0.8")).toBe("fr");
    expect(pickLocale(undefined, "de-DE,de;q=0.9,ru;q=0.8,en;q=0.7")).toBe("ru");
    expect(pickLocale(undefined, "en;q=0.5, fr;q=0.8")).toBe("fr");
  });

  it("falls back to English", () => {
    expect(pickLocale(undefined, "de-DE")).toBe("en");
    expect(pickLocale("xx", null)).toBe("en");
    expect(pickLocale(undefined, "fr;q=0")).toBe("en");
  });
});

describe("safeNext", () => {
  it("keeps paths on this site only", () => {
    expect(safeNext("/map")).toBe("/map");
    expect(safeNext("//evil.example")).toBeUndefined();
    expect(safeNext("https://evil.example")).toBeUndefined();
    expect(safeNext("/\\evil.example")).toBeUndefined();
  });
});

describe("formatDay", () => {
  it("writes the day in the language", () => {
    expect(formatDay("2026-11-14", "en")).toBe("14 November 2026");
    expect(formatDay("2026-11-14", "fr")).toBe("14 novembre 2026");
    expect(formatDay("2026-11-14", "ru")).toBe("14 ноября 2026 г.");
  });
});

describe("ruPlural", () => {
  it("picks the Russian form", () => {
    const form = (n: number) => ruPlural(n, "ответ", "ответа", "ответов");
    expect([1, 2, 5, 11, 12, 21, 22, 25, 101, 111].map(form)).toEqual([
      "ответ",
      "ответа",
      "ответов",
      "ответов",
      "ответов",
      "ответ",
      "ответа",
      "ответов",
      "ответ",
      "ответов",
    ]);
  });
});
