import { Eyebrow } from "@repo/ui/agents/eyebrow";
import { Marquee } from "@repo/ui/agents/marquee";
import { Container } from "@repo/ui/layout/container";
import { Section } from "@repo/ui/layout/section";
import { Stack } from "@repo/ui/layout/stack";
import { Text } from "@repo/ui/typography/text";

import { references } from "../shunpo/content";

export function ReferencesBand() {
  return (
    <Section spacing="sm" aria-label="Références">
      <Container size="wide">
        <Stack gap="lg" align="center">
          <Eyebrow tone="ink">Ils nous ont confié des projets</Eyebrow>
          <Marquee label="Références" lap={30}>
            {references.map((reference) => (
              <Text key={reference.id} as="span" size="lg" weight="medium" tone="muted">
                {reference.name}
                {"        "}
              </Text>
            ))}
          </Marquee>
        </Stack>
      </Container>
    </Section>
  );
}
