import type { Decorator } from "@storybook/react-vite";

import { Direction } from "../../src/layout/direction.tsx";

/* Shows a story in the « Le fil » direction: its colours, faces and corners. */
export function inFilDirection(...[Story]: Parameters<Decorator>) {
  return (
    <Direction name="fil">
      <div className="p-8">
        <Story />
      </div>
    </Direction>
  );
}
