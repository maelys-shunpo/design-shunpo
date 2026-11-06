import { Reveal } from "@repo/ui/instant/reveal";
import { ValueMark } from "@repo/ui/instant/value-mark";
import { VerticalText } from "@repo/ui/instant/vertical-text";
import { Container } from "@repo/ui/layout/container";
import { Inline } from "@repo/ui/layout/inline";
import { Section } from "@repo/ui/layout/section";
import { Stack } from "@repo/ui/layout/stack";
import { Heading } from "@repo/ui/typography/heading";

import { conviction, values } from "../shunpo/content";

/* A rest between plates: the conviction alone on the paper, and the six values as kanji. */
export function ConvictionSection() {
  return (
    <Section spacing="xl" tone="sheet">
      <Container size="wide">
        <Stack gap="3xl">
          <Inline justify="between" align="start" gap="2xl" wrap={false}>
            <Reveal>
              <Heading level={2} size="display">
                {conviction}
              </Heading>
            </Reveal>
            <VerticalText size="lg" tone="muted" label="Shunpo, le pas instantané">
              瞬歩
            </VerticalText>
          </Inline>
          <Inline as="ul" gap="2xl" align="start">
            {values.map((value) => (
              <ValueMark key={value.id} kanji={value.kanji} name={value.name} />
            ))}
          </Inline>
        </Stack>
      </Container>
    </Section>
  );
}
