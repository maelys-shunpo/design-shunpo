import { PhotoStage } from "@repo/ui/agents/photo-stage";
import { GridArea } from "@repo/ui/layout/grid-area";
import { PageGrid } from "@repo/ui/layout/page-grid";
import { Section } from "@repo/ui/layout/section";
import Image from "next/image";

import { ClosingCopy } from "./closing-copy";
import ink from "./images/closing-ink.webp";

export function ClosingSection() {
  return (
    <Section spacing="tight" scheme="dark" aria-label="Réserver un diagnostic">
      <PageGrid>
        <GridArea>
          <PhotoStage
            backdrop={<Image src={ink} alt="" fill sizes="(min-width: 100rem) 100rem, 100vw" />}
          >
            <ClosingCopy />
          </PhotoStage>
        </GridArea>
      </PageGrid>
    </Section>
  );
}
