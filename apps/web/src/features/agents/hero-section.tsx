import { GridArea } from "@repo/ui/layout/grid-area";
import { PageGrid } from "@repo/ui/layout/page-grid";
import { Section } from "@repo/ui/layout/section";

import { HeroCopy } from "./hero-copy";

/* Centred: the promise on 10 columns. The example lives in the section that follows. */
export function HeroSection() {
  return (
    <Section spacing="regular">
      <PageGrid>
        <GridArea columns={{ md: 8, lg: 10 }}>
          <HeroCopy />
        </GridArea>
      </PageGrid>
    </Section>
  );
}
