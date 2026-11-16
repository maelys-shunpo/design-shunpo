import { Container } from "@repo/ui/layout/container";
import { Section } from "@repo/ui/layout/section";
import { Stack } from "@repo/ui/layout/stack";
import { MecaniqueLink } from "@repo/ui/mecanique/mecanique-link";
import { SpecLabel } from "@repo/ui/mecanique/spec-label";
import { Heading } from "@repo/ui/typography/heading";
import { Text } from "@repo/ui/typography/text";

import { contactUrl, promise } from "../shunpo/content";

export function ClosingSection() {
  return (
    <Section spacing="xl" scheme="field" aria-labelledby="diagnostic-titre">
      <Container size="wide">
        <Stack gap="xl" align="start">
          <SpecLabel rule tone="default">
            Diagnostic · {promise}
          </SpecLabel>
          <Heading level={2} size="hero" id="diagnostic-titre">
            Récupérez vos heures.
          </Heading>
          <Text size="lg" measure="prose">
            Racontez-nous votre quotidien, sans jargon. Nous repérons avec vous les tâches qui
            coûtent le plus de temps, et ce qu’il faut pour qu’elles tournent seules.
          </Text>
          <MecaniqueLink href={contactUrl} size="lg">
            Réserver un diagnostic
          </MecaniqueLink>
        </Stack>
      </Container>
    </Section>
  );
}
