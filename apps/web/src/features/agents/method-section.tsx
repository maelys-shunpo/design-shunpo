import { Eyebrow } from "@repo/ui/agents/eyebrow";
import { Headline } from "@repo/ui/agents/headline";
import { GridArea } from "@repo/ui/layout/grid-area";
import { PageGrid } from "@repo/ui/layout/page-grid";
import { Section } from "@repo/ui/layout/section";
import { Stack } from "@repo/ui/layout/stack";
import { Text } from "@repo/ui/typography/text";

import { MethodActions } from "./method-actions";
import { MethodStack } from "./method-stack";
import { MethodThread } from "./method-thread";

/* Two ways through the three phases, shown one after the other until one is chosen. */
const tracks = {
  thread: { id: "methode", label: "Piste A · le fil d’étapes", Walk: MethodThread },
  stack: { id: "methode-pile", label: "Piste B · la pile de cartes", Walk: MethodStack },
} as const;

/* One invoice carried through the three phases, held on screen while the scroll walks them. */
export function MethodSection({ track }: { track: keyof typeof tracks }) {
  const { id, label, Walk } = tracks[track];
  return (
    <Section id={id} spacing="regular">
      <PageGrid rows="md">
        <GridArea columns={{ md: { start: 1, span: 7 }, lg: { start: 1, span: 8 } }}>
          <Stack gap="md">
            <Eyebrow tone="signal">{label}</Eyebrow>
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
          <Walk />
        </GridArea>
        <GridArea>
          <MethodActions />
        </GridArea>
      </PageGrid>
    </Section>
  );
}
