import { describe, expect, it } from "vitest";
import { checkAnswer, checkQuestion } from "./rules";

describe("checkQuestion", () => {
  it("cleans the fields", () => {
    expect(
      checkQuestion({
        title: "  Who repairs   bikes here? ",
        body: "a\r\n\r\n\r\nb",
        skill: " Bike repair ",
      }),
    ).toEqual({ title: "Who repairs bikes here?", body: "a\n\nb", skill: "Bike repair" });
  });

  it("asks for a real title", () => {
    expect(checkQuestion({ title: "hm?", body: "", skill: "" })).toEqual({ problem: "title" });
    expect(checkQuestion({ title: null, body: "", skill: "" })).toEqual({ problem: "title" });
  });

  it("takes one skill, not a list", () => {
    expect(checkQuestion({ title: "Who can help?", body: "", skill: "baking, cooking" })).toEqual({
      problem: "skill",
    });
    expect(checkQuestion({ title: "Who can help?", body: "", skill: "x".repeat(41) })).toEqual({
      problem: "skill",
    });
  });
});

describe("checkAnswer", () => {
  it("keeps text and refuses nothing", () => {
    expect(checkAnswer(" Yes, me. ")).toBe("Yes, me.");
    expect(checkAnswer(" ")).toBeUndefined();
    expect(checkAnswer(undefined)).toBeUndefined();
  });
});
