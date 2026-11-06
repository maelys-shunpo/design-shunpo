import { Container } from "@repo/ui/layout/container";
import { Section } from "@repo/ui/layout/section";
import { Stack } from "@repo/ui/layout/stack";
import { Heading } from "@repo/ui/typography/heading";
import { Text } from "@repo/ui/typography/text";

export function ProposalsIntro() {
  return (
    <Section spacing="md">
      <Container size="wide">
        <Stack gap="lg">
          <Heading level={1} size="hero">
            Une promesse, trois façons de la faire ressentir.
          </Heading>
          <Text size="lg" measure="prose" tone="muted">
            SHUNPO vous libère du temps. Chaque page raconte la même chose avec les mêmes faits :
            des outils dispersés, un système relié, du temps rendu. Seule la manière change.
          </Text>
        </Stack>
      </Container>
    </Section>
  );
}
