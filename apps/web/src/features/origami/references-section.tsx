import { Container } from "@repo/ui/layout/container";
import { Section } from "@repo/ui/layout/section";
import { Stack } from "@repo/ui/layout/stack";
import { Emphasis } from "@repo/ui/origami/emphasis";
import { ReferenceLine } from "@repo/ui/origami/reference-line";
import { Heading } from "@repo/ui/typography/heading";

import { references } from "@/features/shunpo/content";

export function ReferencesSection() {
  return (
    <Section id="references" spacing="xl" tone="muted">
      <Container size="wide">
        <Stack gap="2xl">
          <Heading level={2} size="display">
            Des pièces <Emphasis>déjà en service.</Emphasis>
          </Heading>
          <Stack as="div" gap="none">
            {references.map((reference) => (
              <ReferenceLine
                key={reference.id}
                href={reference.href}
                name={reference.name}
                project={reference.project}
                stake={reference.stake}
              />
            ))}
          </Stack>
        </Stack>
      </Container>
    </Section>
  );
}
