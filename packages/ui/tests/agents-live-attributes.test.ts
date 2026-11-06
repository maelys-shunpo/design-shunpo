import { describe, expect, it } from "vitest";

import { liveAttributes } from "../src/agents/live.ts";

describe("live attributes", () => {
  it("marks a piece with its step and kind, and leaves a static piece bare", () => {
    expect(liveAttributes({})).toEqual({});
    expect(liveAttributes({ live: 2 })).toEqual({ "data-live": "2", "data-live-kind": undefined });
    expect(liveAttributes({ live: 1, liveKind: "appear" })["data-live-kind"]).toBeUndefined();
    expect(liveAttributes({ live: 3, liveKind: "grow" })["data-live-kind"]).toBe("grow");
  });
});
