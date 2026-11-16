import type { RefObject } from "react";

/* The element behind a ref once React attached it, which is always the case inside effects. */
export function mounted<T>(ref: RefObject<T | null>): T {
  if (ref.current === null) {
    throw new Error("The element is not mounted yet.");
  }
  return ref.current;
}
