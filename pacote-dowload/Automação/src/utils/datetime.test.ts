import { describe, expect, it } from "vitest";
import { formatLocalDateTime, parseLocalDateTime } from "./datetime";

describe("datetime helpers", () => {
  it("formats a local date and time string", () => {
    const date = new Date(2026, 5, 20, 9, 5, 0, 0);

    expect(formatLocalDateTime(date)).toBe("2026-06-20 09:05");
  });

  it("parses a local date and time string", () => {
    const date = parseLocalDateTime("2026-06-20 09:05");

    expect(date).not.toBeNull();
    expect(date?.getFullYear()).toBe(2026);
    expect(date?.getMonth()).toBe(5);
    expect(date?.getDate()).toBe(20);
    expect(date?.getHours()).toBe(9);
    expect(date?.getMinutes()).toBe(5);
  });

  it("rejects invalid date formats", () => {
    expect(parseLocalDateTime("20/06/2026 09:05")).toBeNull();
  });
});