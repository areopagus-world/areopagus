import { describe, expect, it } from "vitest";
import { LOCALES } from "./locales";
import { messagesFor } from "./messages";

/** Every leaf of the messages, functions called with sample values. */
function leaves(value: unknown, path = ""): [string, string][] {
  if (typeof value === "string") return [[path, value]];
  if (typeof value === "function") {
    const sample = (value as (...args: unknown[]) => unknown)(
      ...[1, 2, 3].map((n) => (path.includes("ask") || path.includes("note") ? `X${n}` : n)),
    );
    return [[path, String(sample)]];
  }
  return Object.entries(value as object).flatMap(([key, inner]) =>
    leaves(inner, path ? `${path}.${key}` : key),
  );
}

describe("messages", () => {
  it("have no empty text and no AI-style dashes in any language", () => {
    for (const locale of LOCALES) {
      for (const [path, text] of leaves(messagesFor(locale))) {
        expect(text.trim(), `${locale} ${path}`).not.toBe("");
        expect(text, `${locale} ${path}`).not.toMatch(/[—–]/);
      }
    }
  });

  it("use French spacing before French punctuation", () => {
    const fr = messagesFor("fr");
    expect(fr.login.store).toBe("Ce que nous conservons et pourquoi :");
    expect(fr.login.sentHelp).toContain("minutes ?");
    expect(fr.common.hidden("x")).toBe("Masqué par un modérateur : x");
  });

  it("count in Russian", () => {
    const ru = messagesFor("ru");
    expect(ru.common.members(1)).toBe("1 участник");
    expect(ru.common.members(3)).toBe("3 участника");
    expect(ru.common.answers(11)).toBe("11 ответов");
  });
});
