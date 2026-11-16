import type { ComponentType } from "react";

import { Direction } from "../../src/layout/direction.tsx";

/* « Agents » components read the direction's paper, ink, faces and status colours. */
export function inAgents(Story: ComponentType) {
  return (
    <Direction name="agents">
      <Story />
    </Direction>
  );
}

/* A flat plate standing for a photographed surface in stories. */
export const PLATE =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 9'%3E%3Crect width='16' height='9' fill='%23e8e2d6'/%3E%3C/svg%3E";
