import { Marquee } from "@repo/ui/agents/marquee";
import { ReferenceTile } from "@repo/ui/agents/reference-tile";
import { ToolColumns } from "@repo/ui/agents/tool-columns";
import Image from "next/image";

import { referenceLogoColumns } from "./references-logos";

const directions = ["up", "down", "up"] as const;
const laps = [34, 40, 30] as const;

/* The clients' logos in three columns drifting in turn up and down, like the wall of tools. */
export function ReferencesWall() {
  return (
    <ToolColumns lean="tilted">
      {referenceLogoColumns.map((column, index) => (
        <Marquee
          key={column[0].name}
          direction={directions[index] ?? "up"}
          lap={laps[index] ?? 34}
          label={`Références, colonne ${String(index + 1)}`}
        >
          {column.map((logo) => (
            <ReferenceTile
              key={logo.name}
              name={logo.name}
              size="lg"
              logo={<Image src={logo.image} alt="" width={logo.width} height={logo.height} />}
            />
          ))}
        </Marquee>
      ))}
    </ToolColumns>
  );
}
