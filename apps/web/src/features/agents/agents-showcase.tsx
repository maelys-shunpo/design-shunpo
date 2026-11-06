import { AgentTabs } from "@repo/ui/agents/agent-tabs";
import { Eyebrow } from "@repo/ui/agents/eyebrow";
import { Headline } from "@repo/ui/agents/headline";
import { HeadlinePart } from "@repo/ui/agents/headline-part";
import { Container } from "@repo/ui/layout/container";
import { Section } from "@repo/ui/layout/section";
import { Stack } from "@repo/ui/layout/stack";
import { Text } from "@repo/ui/typography/text";

import { showcase } from "./showcase-items";

export function AgentsShowcase() {
  return (
    <Section id="agents" spacing="lg">
      <Container size="wide">
        <Stack gap="3xl">
          <Stack gap="lg">
            <Eyebrow tone="cobalt">Trois agents en service</Eyebrow>
            <Headline level={2} size="title">
              <HeadlinePart tone="dim">Un agent, c’est </HeadlinePart>
              <HeadlinePart>un collègue qui ne lâche rien</HeadlinePart>
              <HeadlinePart tone="dim"> et sait quand demander.</HeadlinePart>
            </Headline>
            <Text size="lg" tone="muted" measure="prose">
              Chaque agent est conçu pour un process précis de votre entreprise, branché sur vos
              outils, avec des règles écrites avec vous. Ce qui est sensible repasse toujours par
              une personne.
            </Text>
          </Stack>
          <AgentTabs label="Choisir un agent" items={showcase} />
        </Stack>
      </Container>
    </Section>
  );
}
