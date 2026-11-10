import { MethodWheel } from "@repo/ui/agents/method-wheel";
import { GridArea } from "@repo/ui/layout/grid-area";
import { PageGrid } from "@repo/ui/layout/page-grid";
import { Section } from "@repo/ui/layout/section";
import { Stack } from "@repo/ui/layout/stack";
import { Text } from "@repo/ui/typography/text";

import { MethodActions } from "./method-actions";
import { agentsMethodFilm } from "./method-film";
import { MethodQuestion } from "./method-question";
import { agentsMethod } from "./method-steps";

/* The method as the home page's wheel: the question alone, then the ink stroke and its dots carry the paper from the
   handshake to the bridge to the bonsai, through 見 築 進. What the Immersion leaves behind and the call to book it follow, once the wheel lets go. */
export function MethodSection() {
  return (
    <Section id="methode" spacing="regular">
      <Stack gap="xl">
        <MethodWheel title={<MethodQuestion />} phases={agentsMethod} film={agentsMethodFilm} />
        <PageGrid>
          <GridArea columns={{ md: { start: 2, span: 6 }, lg: { start: 3, span: 6 } }}>
            <Stack gap="lg" align="start">
              <Text size="lg" tone="muted" measure="prose">
                Tout commence par 5 jours d’Immersion auprès de vos équipes. Vous en repartez avec
                la carte de vos processus, vos heures perdues estimées et une feuille de route
                priorisée.
              </Text>
              <MethodActions />
            </Stack>
          </GridArea>
        </PageGrid>
      </Stack>
    </Section>
  );
}
