import { Headline } from "@repo/ui/agents/headline";
import { GridArea } from "@repo/ui/layout/grid-area";
import { PageGrid } from "@repo/ui/layout/page-grid";
import { Section } from "@repo/ui/layout/section";
import { Stack } from "@repo/ui/layout/stack";

import { ReferencesWall } from "./references-wall";

/* The clients who trusted us, opening the proof: the title on one half, their logos drifting in three columns on the other. */
export function ReferencesBand() {
  return (
    <Section spacing="regular" aria-label="Références">
      <PageGrid rows="xl" align="center">
        <GridArea columns={{ lg: { start: 1, span: 6 } }}>
          <Stack gap="xl">
            <Headline level={2} size="title" entrance="lines">
              Ils nous ont confié des projets
            </Headline>
          </Stack>
        </GridArea>
        <GridArea columns={{ lg: { start: 7, span: 6 } }}>
          <ReferencesWall />
        </GridArea>
      </PageGrid>
    </Section>
  );
}
