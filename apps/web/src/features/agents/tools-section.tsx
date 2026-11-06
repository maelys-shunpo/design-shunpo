import { Eyebrow } from "@repo/ui/agents/eyebrow";
import { Headline } from "@repo/ui/agents/headline";
import { HeadlinePart } from "@repo/ui/agents/headline-part";
import { Container } from "@repo/ui/layout/container";
import { Grid } from "@repo/ui/layout/grid";
import { Section } from "@repo/ui/layout/section";
import { Stack } from "@repo/ui/layout/stack";
import { Text } from "@repo/ui/typography/text";

import { SyncFeed } from "./sync-feed";
import { ToolsWall } from "./tools-wall";

export function ToolsSection() {
  return (
    <Section id="outils" spacing="lg" tone="muted">
      <Container size="wide">
        <Grid columns="2" from="lg" gap="3xl" align="center">
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
          <ToolsWall />
        </Grid>
      </Container>
    </Section>
  );
}
