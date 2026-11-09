import { ConnectionHub } from "@repo/ui/agents/connection-hub";
import { Eyebrow } from "@repo/ui/agents/eyebrow";
import { Headline } from "@repo/ui/agents/headline";
import { Shuriken } from "@repo/ui/brand/shuriken";
import { GridArea } from "@repo/ui/layout/grid-area";
import { PageGrid } from "@repo/ui/layout/page-grid";
import { Section } from "@repo/ui/layout/section";
import { Stack } from "@repo/ui/layout/stack";
import { Text } from "@repo/ui/typography/text";

import { hubMessages, nearTools, farTools } from "./tools";

/* The copy centred over one illustration: the agent in the middle, every tool wired to it. */
export function ToolsSection() {
  return (
    <Section id="outils" spacing="breath" tone="muted">
      <PageGrid rows="xl">
        <GridArea columns={{ md: 6, lg: 8 }}>
          <Stack gap="xl" align="center">
            <Eyebrow align="center">Connectez vos outils</Eyebrow>
            <Headline level={2} size="title" align="center">
              Vos agents travaillent dans les outils que vous avez déjà
            </Headline>
            <Text size="lg" tone="muted" measure="prose" align="center">
              L’ERP reste votre comptabilité, le CRM votre suivi commercial. Les agents y créent,
              complètent et relancent comme le ferait un collègue, et chaque action reste visible
              dans votre espace de travail. Quand un outil n’a pas de connecteur, nous le
              construisons.
            </Text>
          </Stack>
        </GridArea>
        <GridArea columns={{ lg: 10 }}>
          <ConnectionHub
            label="Un agent relié à vos outils"
            hub={<Shuriken size="lg" />}
            near={nearTools}
            far={farTools}
            messages={hubMessages}
          />
        </GridArea>
      </PageGrid>
    </Section>
  );
}
