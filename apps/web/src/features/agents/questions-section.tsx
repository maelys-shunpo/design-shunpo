import { FaqList } from "@repo/ui/agents/faq-list";
import { Section } from "@repo/ui/layout/section";

import { objections } from "../shunpo/content";

export function QuestionsSection() {
  return (
    <Section id="questions" spacing="regular" paper="plie">
      <FaqList title="Les questions qu’on nous pose le plus." items={objections} />
    </Section>
  );
}
