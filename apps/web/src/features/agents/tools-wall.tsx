import { Marquee } from "@repo/ui/agents/marquee";
import { ToolColumns } from "@repo/ui/agents/tool-columns";
import { ToolTile } from "@repo/ui/agents/tool-tile";

import { toolColumns } from "./tools";

const directions = ["up", "down", "up"] as const;
const laps = [46, 52, 40] as const;

/* Three columns of tool tiles drifting in turn up and down, like a wall of connected apps. */
export function ToolsWall() {
  return (
    <ToolColumns>
      {toolColumns.map((column, index) => (
        <Marquee
          key={column[0]?.slug}
          direction={directions[index] ?? "up"}
          lap={laps[index] ?? 46}
          label={`Outils, colonne ${String(index + 1)}`}
        >
          {column.map((icon) => (
            <ToolTile key={icon.slug} icon={icon} />
          ))}
        </Marquee>
      ))}
    </ToolColumns>
  );
}
