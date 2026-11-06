import { AgentTabs } from "@repo/ui/agents/agent-tabs";
import { Eyebrow } from "@repo/ui/agents/eyebrow";
import { Headline } from "@repo/ui/agents/headline";
import { SectionTab } from "@repo/ui/agents/section-tab";
import { GridArea } from "@repo/ui/layout/grid-area";
import { PageGrid } from "@repo/ui/layout/page-grid";
import { Section } from "@repo/ui/layout/section";
import { Stack } from "@repo/ui/layout/stack";
import { Text } from "@repo/ui/typography/text";

import { showcase } from "./showcase-items";

/* Editorial: the label alone on the first three columns, the title and lead from the fourth, the tabs below on
   every content column with their own inner layout. */
export function AgentsShowcase() {
  return (
    <Section id="agents" spacing="breath">
      <PageGrid rows="lg">
        <GridArea columns={{ md: { start: 1, span: 2 }, lg: { start: 1, span: 3 } }}>
          <Stack gap="md">
            <SectionTab />
            <Eyebrow tone="cobalt">Trois agents en service</Eyebrow>
          </Stack>
        </GridArea>
        <GridArea
          columns={{ md: { start: 3, span: 6 }, lg: { start: 4, span: 9 } }}
          overflow="visible"
        >
          <Headline level={2} size="title">
            Chaque agent tient un rôle précis dans votre équipe
          </Headline>
        </GridArea>
        <GridArea columns={{ md: { start: 3, span: 6 }, lg: { start: 4, span: 6 } }}>
          <Text size="lg" tone="muted">
            Chaque agent est conçu pour un process précis de votre entreprise, branché sur vos
            outils, avec des règles écrites avec vous. Ce qui est sensible repasse toujours par une
            personne.
          </Text>
        </GridArea>
        <GridArea>
          <AgentTabs label="Choisir un agent" items={showcase} />
        </GridArea>
      </PageGrid>
    </Section>
  );
}
