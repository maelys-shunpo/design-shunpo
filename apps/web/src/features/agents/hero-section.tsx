import { Container } from "@repo/ui/layout/container";
import { Section } from "@repo/ui/layout/section";
import { Stack } from "@repo/ui/layout/stack";

import { HeroCopy } from "./hero-copy";
import { HeroStage } from "./hero-stage";

export function HeroSection() {
  return (
    <Section spacing="sm">
      <Container size="wide">
        <Stack gap="3xl">
          <HeroCopy />
          <HeroStage />
        </Stack>
      </Container>
    </Section>
  );
}
