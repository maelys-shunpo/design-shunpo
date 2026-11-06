import { Headline } from "@repo/ui/agents/headline";
import { SectionTab } from "@repo/ui/agents/section-tab";
import { GridArea } from "@repo/ui/layout/grid-area";
import { PageGrid } from "@repo/ui/layout/page-grid";
import { Section } from "@repo/ui/layout/section";
import { Stack } from "@repo/ui/layout/stack";
import { Text } from "@repo/ui/typography/text";

import { MethodActions } from "./method-actions";
import { MethodProgress } from "./method-progress";

/* One stage carries the same invoice through the three phases, held on screen while the scroll walks them. */
export function MethodSection() {
  return (
    <Section id="methode" spacing="regular">
      <PageGrid rows="md">
        <GridArea columns={{ md: { start: 1, span: 7 }, lg: { start: 1, span: 8 } }}>
          <Stack gap="md">
            <SectionTab />
            <Headline level={2} size="heading">
              Chaque projet commence par une Immersion
            </Headline>
            <Text size="lg" tone="muted" measure="prose">
              Le diagnostic est un premier échange pour voir où un agent peut vous aider. Si nous
              avançons ensemble, le projet commence par une Immersion auprès de vos équipes.
            </Text>
          </Stack>
        </GridArea>
        <GridArea>
          <MethodProgress />
        </GridArea>
        <GridArea>
          <MethodActions />
        </GridArea>
      </PageGrid>
    </Section>
  );
}
