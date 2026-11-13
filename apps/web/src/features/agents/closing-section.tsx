import { ClosingCoupe } from "@repo/ui/agents/closing-coupe";
import { Section } from "@repo/ui/layout/section";

import { ClosingCopy } from "./closing-copy";

export function ClosingSection() {
  return (
    <Section spacing="flush" aria-label="Parlons de votre projet">
      <ClosingCoupe>
        <ClosingCopy />
      </ClosingCoupe>
    </Section>
  );
}
