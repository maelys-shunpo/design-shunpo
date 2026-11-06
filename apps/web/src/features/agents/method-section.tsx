import { Eyebrow } from "@repo/ui/agents/eyebrow";
import { Headline } from "@repo/ui/agents/headline";
import { HeadlinePart } from "@repo/ui/agents/headline-part";
import { Container } from "@repo/ui/layout/container";
import { Section } from "@repo/ui/layout/section";
import { Stack } from "@repo/ui/layout/stack";

import { MethodScene } from "./method-scene";

export function MethodSection() {
  return (
    <Section id="methode" spacing="lg">
      <Container size="wide">
        <Stack gap="2xl">
          <Stack gap="lg">
            <Eyebrow tone="cobalt">Méthode</Eyebrow>
            <Headline level={2} size="title">
              <HeadlinePart tone="dim">D’abord comprendre, </HeadlinePart>
              <HeadlinePart>ensuite construire, </HeadlinePart>
              <HeadlinePart tone="dim">puis vous rendre la main.</HeadlinePart>
            </Headline>
          </Stack>
          <MethodScene />
        </Stack>
      </Container>
    </Section>
  );
}
