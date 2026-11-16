import { describe, expect, it } from "vitest";

import { defaultCursorMode, scrubProgress } from "../src/agents/cursor-model.ts";

describe("defaultCursorMode", () => {
  it("leaves the native cursor where the visitor types", () => {
    expect(defaultCursorMode({ tagName: "INPUT", role: null, editable: false })).toBe("native");
    expect(defaultCursorMode({ tagName: "TEXTAREA", role: null, editable: false })).toBe("native");
    expect(defaultCursorMode({ tagName: "SELECT", role: null, editable: false })).toBe("native");
    expect(defaultCursorMode({ tagName: "DIV", role: null, editable: true })).toBe("native");
  });

  it("steps aside for a control that answers the pointer itself", () => {
    expect(defaultCursorMode({ tagName: "A", role: null, editable: false })).toBe("hide");
    expect(defaultCursorMode({ tagName: "BUTTON", role: null, editable: false })).toBe("hide");
    expect(defaultCursorMode({ tagName: "SUMMARY", role: null, editable: false })).toBe("hide");
    expect(defaultCursorMode({ tagName: "DIV", role: "tab", editable: false })).toBe("hide");
    expect(defaultCursorMode({ tagName: "CANVAS", role: null, editable: false })).toBe("hide");
  });

  it("is the point everywhere else", () => {
    expect(defaultCursorMode({ tagName: "P", role: null, editable: false })).toBe("point");
    expect(defaultCursorMode({ tagName: "SECTION", role: "region", editable: false })).toBe(
      "point",
    );
  });
});

describe("scrubProgress", () => {
  const viewport = 900;

  it("is nothing before the held scene reaches the top of the screen", () => {
    expect(scrubProgress({ top: 300, height: 2700 }, viewport)).toBe(0);
    expect(scrubProgress({ top: 0, height: 2700 }, viewport)).toBe(0);
  });

  it("follows the scroll through the hold", () => {
    expect(scrubProgress({ top: -900, height: 2700 }, viewport)).toBeCloseTo(0.5);
  });

  it("is full once the hold is over", () => {
    expect(scrubProgress({ top: -1800, height: 2700 }, viewport)).toBe(1);
    expect(scrubProgress({ top: -4000, height: 2700 }, viewport)).toBe(1);
  });

  it("is full as soon as a scene no taller than the screen starts to leave it", () => {
    expect(scrubProgress({ top: 0, height: 600 }, viewport)).toBe(0);
    expect(scrubProgress({ top: -1, height: 600 }, viewport)).toBe(1);
  });
});
