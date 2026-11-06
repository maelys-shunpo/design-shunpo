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
            Deux nouvelles directions, parties de zéro.
          </Heading>
          <Text size="lg" measure="prose" tone="muted">
            Une agence qui conçoit des agents IA, des automatisations et des logiciels sur mesure
            pour faire gagner du temps aux entreprises. Aucun élément de l’ancienne charte : ni
            couleurs, ni typographies, ni logo.
          </Text>
        </Stack>
      </Container>
    </Section>
  );
}
