import { Container } from "@repo/ui/layout/container";
import { Grid } from "@repo/ui/layout/grid";
import { Section } from "@repo/ui/layout/section";
import { Stack } from "@repo/ui/layout/stack";
import { Emphasis } from "@repo/ui/origami/emphasis";
import { MethodStep } from "@repo/ui/origami/method-step";
import { Heading } from "@repo/ui/typography/heading";
import { Text } from "@repo/ui/typography/text";

import { method } from "@/features/shunpo/content";

const numerals = ["I", "II", "III"] as const;

export function MethodSection() {
  return (
    <Section id="methode" spacing="xl">
      <Container size="wide">
        <Stack gap="3xl">
          <Stack gap="md">
            <Heading level={2} size="display">
              La méthode, <Emphasis>pli par pli.</Emphasis>
            </Heading>
            <Text size="lg" tone="muted" measure="prose">
              Ce que la feuille vient de raconter, voici comment nous le faisons avec vous. Chaque
              étape prépare la suivante, et rien n’est construit avant d’avoir été compris.
            </Text>
          </Stack>
          <Grid as="ol" columns="3" gap="xl">
            {method.map((step, index) => (
              <MethodStep key={step.id} numeral={numerals[index] ?? step.index} title={step.title}>
                {step.detail}
              </MethodStep>
            ))}
          </Grid>
        </Stack>
      </Container>
    </Section>
  );
}
