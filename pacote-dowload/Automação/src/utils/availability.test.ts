import { describe, expect, it } from "vitest";
import { buildAvailableSlots } from "./availability";

describe("buildAvailableSlots", () => {
  it("generates available slots from a working window", () => {
    const slots = buildAvailableSlots({
      dateISO: "2026-06-20",
      durationMins: 30,
      workingHours: [{ start: "09:00", end: "10:00" }],
      appointments: [],
    });

    expect(slots).toEqual([
      "2026-06-20 09:00",
      "2026-06-20 09:15",
      "2026-06-20 09:30",
    ]);
  });

  it("removes slots that collide with existing appointments", () => {
    const slots = buildAvailableSlots({
      dateISO: "2026-06-20",
      durationMins: 30,
      workingHours: [{ start: "09:00", end: "11:00" }],
      appointments: [
        {
          start: new Date(2026, 5, 20, 9, 30),
          end: new Date(2026, 5, 20, 10, 0),
        },
      ],
    });

    expect(slots).toEqual([
      "2026-06-20 09:00",
      "2026-06-20 10:00",
      "2026-06-20 10:15",
      "2026-06-20 10:30",
    ]);
  });
});