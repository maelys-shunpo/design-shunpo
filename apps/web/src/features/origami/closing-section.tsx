import { Container } from "@repo/ui/layout/container";
import { Section } from "@repo/ui/layout/section";
import { Stack } from "@repo/ui/layout/stack";
import { Emphasis } from "@repo/ui/origami/emphasis";
import { OrigamiLink } from "@repo/ui/origami/origami-link";
import { Heading } from "@repo/ui/typography/heading";
import { Text } from "@repo/ui/typography/text";

import { contactUrl } from "@/features/shunpo/content";

export function ClosingSection() {
  return (
    <Section spacing="xl">
      <Container size="wide">
        <Stack gap="xl" align="start">
          <Heading level={2} size="hero">
            Apportez votre <Emphasis>feuille blanche.</Emphasis>
          </Heading>
          <Text size="lg" tone="muted" measure="prose">
            Un diagnostic pour repérer avec vous les tâches qui coûtent le plus de temps, et ce
            qu’il faut pour qu’elles se fassent seules.
          </Text>
          <OrigamiLink href={contactUrl}>Réserver un diagnostic</OrigamiLink>
        </Stack>
      </Container>
    </Section>
  );
}
