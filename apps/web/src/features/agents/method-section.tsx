import { Eyebrow } from "@repo/ui/agents/eyebrow";
import { Headline } from "@repo/ui/agents/headline";
import { HeadlinePart } from "@repo/ui/agents/headline-part";
import { GridArea } from "@repo/ui/layout/grid-area";
import { PageGrid } from "@repo/ui/layout/page-grid";
import { Section } from "@repo/ui/layout/section";

import { MethodScene } from "./method-scene";

/* Editorial opener, then the held scene on every content column with its own inner layout. */
export function MethodSection() {
  return (
    <Section id="methode" spacing="regular">
      <PageGrid rows="lg">
        <GridArea columns={{ md: { start: 1, span: 2 }, lg: { start: 1, span: 3 } }}>
          <Eyebrow tone="cobalt">Méthode</Eyebrow>
        </GridArea>
        <GridArea
          columns={{ md: { start: 3, span: 6 }, lg: { start: 4, span: 9 } }}
          overflow="visible"
        >
          <Headline level={2} size="title">
            <HeadlinePart tone="dim">D’abord comprendre, </HeadlinePart>
            <HeadlinePart>ensuite construire, </HeadlinePart>
            <HeadlinePart tone="dim">puis vous rendre la main.</HeadlinePart>
          </Headline>
        </GridArea>
        <GridArea>
          <MethodScene />
        </GridArea>
      </PageGrid>
    </Section>
  );
}
