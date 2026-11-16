/* Where a mouse counts as being over the cookie rather than the empty paper around it, shared by the pill cursor
   and the pick-up lift. */

/* Only where a mouse hovers: touch screens read the cookie flat, with the label under it. */
export const MOUSE = "(hover: hover) and (pointer: fine)";

/* The cookie fills an ellipse inside its button: pointer effects fire over it, never over the white around. */
const COOKIE_RX = 0.42;
const COOKIE_RY = 0.4;
const COOKIE_CY = 0.42;

/* Whether the box-relative point sits over the cookie's ellipse. */
export function onCookie(x: number, y: number, box: DOMRect): boolean {
  const dx = (x - box.width / 2) / (box.width * COOKIE_RX);
  const dy = (y - box.height * COOKIE_CY) / (box.height * COOKIE_RY);
  return dx * dx + dy * dy <= 1;
}

/* The pointer's offset from the cookie's centre, each axis in -1 to 1: which way a grip leans it. */
export function gripOffset(x: number, y: number, box: DOMRect): { nx: number; ny: number } {
  const nx = (x - box.width / 2) / (box.width / 2);
  const ny = (y - box.height * COOKIE_CY) / (box.height * COOKIE_CY);
  return { nx, ny };
}
