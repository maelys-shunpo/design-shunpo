import { Marquee } from "@repo/ui/agents/marquee";
import { ReferenceTile } from "@repo/ui/agents/reference-tile";
import { ToolColumns } from "@repo/ui/agents/tool-columns";

import { references } from "../shunpo/content";

const directions = ["up", "down", "up"] as const;
const laps = [34, 40, 30] as const;

/* Each column starts at a different client, so the wall never shows the same name side by side. */
const columns = [0, 2, 4].map((offset) =>
  references.map((_, index) => references[(index + offset) % references.length]),
);

/* The clients in three columns drifting in turn up and down, like the wall of tools. */
export function ReferencesWall() {
  return (
    <ToolColumns>
      {columns.map((column, index) => (
        <Marquee
          key={column[0]?.id}
          direction={directions[index] ?? "up"}
          lap={laps[index] ?? 34}
          label={`Références, colonne ${String(index + 1)}`}
        >
          {column.map((reference) =>
            reference === undefined ? null : (
              <ReferenceTile
                key={reference.id}
                name={reference.name}
                detail={reference.project}
                size="lg"
              />
            ),
          )}
        </Marquee>
      ))}
    </ToolColumns>
  );
}
