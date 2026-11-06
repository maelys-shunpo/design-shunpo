import { Eyebrow } from "@repo/ui/agents/eyebrow";
import { FaqItem } from "@repo/ui/agents/faq-item";
import { Headline } from "@repo/ui/agents/headline";
import { SectionTab } from "@repo/ui/agents/section-tab";
import { GridArea } from "@repo/ui/layout/grid-area";
import { PageGrid } from "@repo/ui/layout/page-grid";
import { Section } from "@repo/ui/layout/section";
import { Stack } from "@repo/ui/layout/stack";

import { objections } from "../shunpo/content";

/* Asymmetric: the title on five columns, the answers from the seventh, one empty column between. */
export function QuestionsSection() {
  return (
    <Section id="questions" spacing="regular">
      <PageGrid rows="lg">
        <GridArea columns={{ lg: { start: 1, span: 5 } }}>
          <Stack gap="lg">
            <SectionTab />
            <Eyebrow tone="ink">Questions</Eyebrow>
            <Headline level={2} size="heading">
              Ce qu’on nous demande avant de commencer.
            </Headline>
          </Stack>
        </GridArea>
        <GridArea columns={{ lg: { start: 7, span: 6 } }}>
          {objections.map((objection) => (
            <FaqItem key={objection.id} question={objection.question} answer={objection.answer} />
          ))}
        </GridArea>
      </PageGrid>
    </Section>
  );
}
