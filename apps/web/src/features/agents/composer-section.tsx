import { Headline } from "@repo/ui/agents/headline";
import { TaskComposer } from "@repo/ui/agents/task-composer";
import { GridArea } from "@repo/ui/layout/grid-area";
import { PageGrid } from "@repo/ui/layout/page-grid";
import { Section } from "@repo/ui/layout/section";
import { Stack } from "@repo/ui/layout/stack";
import { Text } from "@repo/ui/typography/text";

import { fallback, scenarios } from "./composer-scenarios";

/* Centred: the question on 8 columns, the composer on the same 8. */
export function ComposerSection() {
  return (
    <Section id="essayer" spacing="regular" tone="muted" paper="froisse">
      <PageGrid rows="lg">
        <GridArea columns={{ md: 8, lg: 8 }}>
          <Stack gap="lg" align="center">
            <Headline level={2} size="heading" align="center" entrance="lines">
              Quelle tâche voulez-vous ne plus faire ?
            </Headline>
            <Text size="lg" tone="muted" align="center" measure="prose">
              Décrivez-la en une phrase. Voici le plan qu’un agent suivrait. Le vrai se construit
              avec vous, pendant le diagnostic.
            </Text>
          </Stack>
        </GridArea>
        <GridArea columns={{ md: 8, lg: 8 }}>
          <TaskComposer
            scenarios={scenarios}
            fallback={fallback}
            label="Décrivez une tâche répétitive"
            placeholder="Ex. : recopier les bons de commande dans l’ERP"
            submit="Voir le plan"
            humanLabel="Ce qui reste à votre équipe :"
          />
        </GridArea>
      </PageGrid>
    </Section>
  );
}
