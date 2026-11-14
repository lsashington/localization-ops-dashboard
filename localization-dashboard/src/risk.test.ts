import { describe , it, expect, vi, beforeEach, afterEach } from "vitest";
import { getRisk } from "./risk";

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date("2026-11-12T12:00:00Z"));   // "today" is always Nov 12
});
afterEach(() => {
  vi.useRealTimers();
});

describe("getRisk", () => {
    it("returns overdue for a QA item", () => {
        expect(getRisk("2026-10-12T00:00:00.000Z", "QA")).toBe("overdue");
    });

    it("returns soon for In Translation item", () => {
        expect(getRisk("2026-11-20T00:00:00.000Z", "In Translation")).toBe("soon");
    });

    it("returns ok for QA item", () => {
        expect(getRisk("2027-05-20T00:00:00.000Z", "QA")).toBe("ok");
    });

    it("returns done for Delivered item", () => {
        expect(getRisk("2026-09-09T00:00:00.000Z", "Delivered")).toBe("done");
    });

    it("13.5 days out is soon for QA item", () => {
        expect(getRisk("2026-11-26T00:00:00.000Z", "QA")).toBe("soon");
    });

    it("exactly 14 days out is soon for QA item", () => {
        expect(getRisk("2026-11-26T12:00:00.000Z", "QA")).toBe("soon");
    });

    it("1 second more than 14 days is ok for QA item", () => {
        expect(getRisk("2026-11-26T12:00:01.000Z", "QA")).toBe("ok");
    });
});

