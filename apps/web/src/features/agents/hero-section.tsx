import { GridArea } from "@repo/ui/layout/grid-area";
import { PageGrid } from "@repo/ui/layout/page-grid";
import { Section } from "@repo/ui/layout/section";

import { HeroCopy } from "./hero-copy";
import { HeroStage } from "./hero-stage";

/* Centred: the promise on 10 columns, the console on every content column. */
export function HeroSection() {
  return (
    <Section spacing="regular">
      <PageGrid rows="xl">
        <GridArea columns={{ md: 8, lg: 10 }}>
          <HeroCopy />
        </GridArea>
        <GridArea>
          <HeroStage />
        </GridArea>
      </PageGrid>
    </Section>
  );
}
