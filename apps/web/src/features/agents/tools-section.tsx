import { Arrival } from "@repo/ui/agents/arrival";
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
            label="Vos outils, reliés à votre second cerveau"
            sealLabel="Votre second cerveau"
          >
            <Stack gap="md" align="center">
              <ToolsTitle align="center" />
              <Arrival mode="follow">
                <ToolsLine align="center" />
              </Arrival>
            </Stack>
          </ToolHub>
        </GridArea>
      </PageGrid>
    </Section>
  );
}
