import { ToolHub } from "@repo/ui/agents/tool-hub";
import { GridArea } from "@repo/ui/layout/grid-area";
import { PageGrid } from "@repo/ui/layout/page-grid";
import { Section } from "@repo/ui/layout/section";
import { Stack } from "@repo/ui/layout/stack";

import { deskColumns, phoneColumns } from "./tools";
import { ToolsLine, ToolsTitle } from "./tools-copy";

/* The title and its one line over an octagon holding the agent's seal, the tools cut from the sheet down two arcs,
   each sending a steady flow of ink to the centre. */
export function ToolsSection() {
  return (
    <Section id="outils" height="screen" overflow="clip">
      <PageGrid>
        <GridArea>
          <ToolHub
            desk={deskColumns}
            phone={phoneColumns}
            label="Vos outils, reliés à votre agent"
            sealLabel="Votre agent"
            labels={{
              pause: "Mettre en pause l’animation des outils",
              play: "Relancer l’animation des outils",
            }}
          >
            <Stack gap="md" align="center">
              <ToolsTitle align="center" />
              <ToolsLine align="center" />
            </Stack>
          </ToolHub>
        </GridArea>
      </PageGrid>
    </Section>
  );
}
