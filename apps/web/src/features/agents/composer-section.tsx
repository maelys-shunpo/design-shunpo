import { Eyebrow } from "@repo/ui/agents/eyebrow";
import { Headline } from "@repo/ui/agents/headline";
import { HeadlinePart } from "@repo/ui/agents/headline-part";
import { TaskComposer } from "@repo/ui/agents/task-composer";
import { Container } from "@repo/ui/layout/container";
import { Section } from "@repo/ui/layout/section";
import { Stack } from "@repo/ui/layout/stack";
import { Text } from "@repo/ui/typography/text";

import { fallback, scenarios } from "./composer-scenarios";

export function ComposerSection() {
  return (
    <Section id="essayer" spacing="lg" tone="muted">
      <Container size="narrow">
        <Stack gap="2xl">
          <Stack gap="lg" align="center">
            <Eyebrow>Essayer</Eyebrow>
            <Headline level={2} size="title" align="center">
              <HeadlinePart tone="dim">Quelle tâche voulez-vous </HeadlinePart>
              <HeadlinePart tone="serif">ne plus jamais </HeadlinePart>
              <HeadlinePart>faire ?</HeadlinePart>
            </Headline>
            <Text size="lg" tone="muted" align="center" measure="prose">
              Décrivez-la en une phrase. Voici le plan qu’un agent suivrait. Le vrai se construit
              avec vous, pendant le diagnostic.
            </Text>
          </Stack>
          <TaskComposer
            scenarios={scenarios}
            fallback={fallback}
            label="Décrivez une tâche répétitive"
            placeholder="Ex. : recopier les bons de commande dans l’ERP"
            submit="Voir le plan"
            humanLabel="Ce qui reste à votre équipe :"
          />
        </Stack>
      </Container>
    </Section>
  );
}
