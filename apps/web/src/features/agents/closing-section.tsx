import { ClosingCoupe } from "@repo/ui/agents/closing-coupe";
import { FaqList } from "@repo/ui/agents/faq-list";
import { Section } from "@repo/ui/layout/section";

import { objections } from "../shunpo/content";
import { ClosingCopy } from "./closing-copy";

/* The FAQ, then the closing call it is cut to reveal: the coupe plays on the questions (the nav's #questions anchor
   sits here), so the readable FAQ lives inside the gesture rather than in a section of its own. */
export function ClosingSection() {
  return (
    <Section id="questions" spacing="flush" aria-label="Parlons de votre projet">
      <ClosingCoupe
        faq={<FaqList title="Les questions qu’on nous pose le plus." items={objections} />}
      >
        <ClosingCopy />
      </ClosingCoupe>
    </Section>
  );
}
