import { Eyebrow } from "@repo/ui/agents/eyebrow";
import { Headline } from "@repo/ui/agents/headline";
import { GridArea } from "@repo/ui/layout/grid-area";
import { PageGrid } from "@repo/ui/layout/page-grid";
import { Section } from "@repo/ui/layout/section";
import { Stack } from "@repo/ui/layout/stack";
import { Text } from "@repo/ui/typography/text";

import { ReferencesWall } from "./references-wall";

/* The clients under the hero: the copy on one half, their names drifting in three columns on the other. */
export function ReferencesBand() {
  return (
    <Section spacing="regular" aria-label="Références">
      <PageGrid rows="xl" align="center">
        <GridArea columns={{ lg: { start: 1, span: 6 } }}>
          <Stack gap="xl">
            <Eyebrow>Références</Eyebrow>
            <Headline level={2} size="title">
              Ils nous ont confié des projets
            </Headline>
            <Text size="lg" tone="muted" measure="prose">
              Une application de jeu suivie en direct, une plateforme d’investissement, un programme
              d’affiliation, une expérience web, une boutique en ligne.
            </Text>
          </Stack>
        </GridArea>
        <GridArea columns={{ lg: { start: 7, span: 6 } }}>
          <ReferencesWall />
        </GridArea>
      </PageGrid>
    </Section>
  );
}
