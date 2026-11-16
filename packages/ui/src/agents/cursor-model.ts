/* What the SHUNPO cursor does over an element:
   - point: the small cut square, on the pointer, with no lag;
   - hide: it fades out of the way of a control that answers the pointer itself (a cut action, a bracketed nav link,
     a canvas whose ink parts);
   - shrink: it narrows before a ruled link, whose line already moves;
   - designate: the two-corner frame jumps around the target (Shunpo Shift);
   - scrub: it becomes a short upright line that fills as a held scene is read;
   - away: it goes entirely, with no system cursor either, so a title reads clean;
   - native: the system cursor, where the visitor reads or types. */
export const CURSOR_MODES = [
  "point",
  "hide",
  "shrink",
  "designate",
  "scrub",
  "away",
  "native",
] as const;

export type CursorMode = (typeof CURSOR_MODES)[number];

/* How the frame reaches a new target: it jumps there and leaves ghosts, or it glides with no ghost. */
export type CursorTravel = "shift" | "glide";

/* The point's form: the direction's hard cut square that jumps (`coupe`), a round dot and a ring that trail the pointer
   with a satin lag (`satin`, the Framer-smooth reading), or a single square outline that trails the pointer and fills
   over a control (`carre`). */
export const CURSOR_FORMS = ["coupe", "satin", "carre"] as const;
export type CursorForm = (typeof CURSOR_FORMS)[number];

export function isCursorMode(value: string | undefined): value is CursorMode {
  return CURSOR_MODES.some((mode) => mode === value);
}

interface ElementTraits {
  tagName: string;
  role: string | null;
  editable: boolean;
}

const TYPED = new Set(["INPUT", "TEXTAREA", "SELECT"]);
const ANSWERING = new Set(["A", "BUTTON", "SUMMARY", "CANVAS"]);
const ANSWERING_ROLES = new Set(["button", "link", "tab", "switch", "checkbox", "slider"]);

/* The mode of an element no component named: native where the visitor types, out of the way of a control. */
export function defaultCursorMode({ tagName, role, editable }: ElementTraits): CursorMode {
  if (editable || TYPED.has(tagName)) {
    return "native";
  }
  if (ANSWERING.has(tagName) || (role !== null && ANSWERING_ROLES.has(role))) {
    return "hide";
  }
  return "point";
}

interface HeldBox {
  top: number;
  height: number;
}

/* How far a held scene has been read: nothing while its top is at or below the screen's, all of it once its end
   reaches the screen's end. */
export function scrubProgress({ top, height }: HeldBox, viewport: number): number {
  const hold = Math.max(height - viewport, 1);
  return Math.min(Math.max(-top / hold, 0), 1);
}
