import { describe, expect, it } from "vitest";
import { checkEvent, eventId, parseDay } from "./rules";

const now = new Date("2026-11-14T12:00:00Z");

describe("parseDay", () => {
  it("accepts real days, past and up to a year ahead", () => {
    expect(parseDay("2026-11-14", now)).toBe("2026-11-14");
    expect(parseDay("1987-03-02", now)).toBe("1987-03-02");
    expect(parseDay("2027-11-01", now)).toBe("2027-11-01");
  });

  it("refuses what is not a day", () => {
    for (const bad of [
      "",
      "14.11.2026",
      "2026-02-30",
      "2026-13-01",
      "1899-12-31",
      "2028-01-01",
      null,
      5,
    ]) {
      expect(parseDay(bad, now), String(bad)).toBeUndefined();
    }
  });
});

describe("checkEvent", () => {
  it("cleans the fields and reads visibility", () => {
    expect(
      checkEvent(
        {
          day: "2026-11-14",
          title: "  First light  on the map ",
          body: "a\r\n\r\n\r\n\r\nb",
          onlyMe: null,
        },
        now,
      ),
    ).toEqual({
      happenedOn: "2026-11-14",
      title: "First light on the map",
      body: "a\n\nb",
      visibility: "public",
      level: null,
    });
    expect(
      checkEvent({ day: "2026-11-14", title: "x", body: "", onlyMe: "on" }, now),
    ).toMatchObject({
      visibility: "private",
    });
  });

  it("reads the level of the deed, and leaves it empty when none is named", () => {
    const base = { day: "2026-11-14", title: "x", body: "", onlyMe: null };
    expect(checkEvent({ ...base, level: "6" }, now)).toMatchObject({ level: 6 });
    for (const none of ["", "0", "9", "6.5", "-1", null, undefined]) {
      expect(checkEvent({ ...base, level: none }, now), String(none)).toMatchObject({
        level: null,
      });
    }
  });

  it("names the problem", () => {
    expect(checkEvent({ day: "soon", title: "x", body: "", onlyMe: null }, now)).toEqual({
      problem: "event-date",
    });
    expect(checkEvent({ day: "2026-11-14", title: "   ", body: "", onlyMe: null }, now)).toEqual({
      problem: "event-title",
    });
  });
});

describe("eventId", () => {
  it("accepts only a uuid", () => {
    expect(eventId("0b0e4f1e-7c1a-4f6e-9d53-2a4b6c8d0e1f")).toBe(
      "0b0e4f1e-7c1a-4f6e-9d53-2a4b6c8d0e1f",
    );
    expect(eventId("")).toBeUndefined();
    expect(eventId("1; drop table events")).toBeUndefined();
  });
});
