import { PhotoStage } from "@repo/ui/agents/photo-stage";
import { Container } from "@repo/ui/layout/container";
import { Section } from "@repo/ui/layout/section";
import Image from "next/image";

import { ClosingCopy } from "./closing-copy";
import ink from "./images/closing-ink.webp";

export function ClosingSection() {
  return (
    <Section spacing="md" scheme="dark" aria-label="Réserver un diagnostic">
      <Container size="wide">
        <PhotoStage
          backdrop={<Image src={ink} alt="" fill sizes="(min-width: 90rem) 90rem, 100vw" />}
        >
          <ClosingCopy />
        </PhotoStage>
      </Container>
    </Section>
  );
}
