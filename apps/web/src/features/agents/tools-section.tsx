import { Eyebrow } from "@repo/ui/agents/eyebrow";
import { Headline } from "@repo/ui/agents/headline";
import { HeadlinePart } from "@repo/ui/agents/headline-part";
import { GridArea } from "@repo/ui/layout/grid-area";
import { PageGrid } from "@repo/ui/layout/page-grid";
import { Section } from "@repo/ui/layout/section";
import { Stack } from "@repo/ui/layout/stack";
import { Text } from "@repo/ui/typography/text";

import { SyncFeed } from "./sync-feed";
import { ToolsWall } from "./tools-wall";

/* Symmetric: the copy and the live feed on one half, the wall of tools on the other. */
export function ToolsSection() {
  return (
    <Section id="outils" spacing="breath" tone="muted">
      <PageGrid rows="xl" align="center">
        <GridArea columns={{ lg: { start: 1, span: 6 } }}>
          <Stack gap="xl">
            <Eyebrow>Connectez vos outils</Eyebrow>
            <Headline level={2} size="title">
              <HeadlinePart tone="dim">Branchés sur </HeadlinePart>
              <HeadlinePart>les outils que vous utilisez déjà.</HeadlinePart>
            </Headline>
            <Text size="lg" tone="muted" measure="prose">
              Pas besoin de tout remplacer. Nos agents lisent et écrivent dans votre messagerie,
              votre CRM, votre ERP et vos tableurs. Quand un outil n’a pas de connecteur, nous le
              construisons.
            </Text>
            <SyncFeed />
          </Stack>
        </GridArea>
        <GridArea columns={{ lg: { start: 7, span: 6 } }}>
          <ToolsWall />
        </GridArea>
      </PageGrid>
    </Section>
  );
}
