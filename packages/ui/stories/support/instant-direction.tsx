import type { ComponentType } from "react";

import { Direction } from "../../src/layout/direction.tsx";

/* Instant components read the Instant direction's paper, ink and faces. */
export function inInstant(Story: ComponentType) {
  return (
    <Direction name="instant">
      <Story />
    </Direction>
  );
}
