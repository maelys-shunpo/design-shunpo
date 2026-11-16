import { Cursor } from "@repo/ui/agents/cursor";
import { Direction } from "@repo/ui/layout/direction";
import { GridArea } from "@repo/ui/layout/grid-area";
import { PageGrid } from "@repo/ui/layout/page-grid";
import { Section } from "@repo/ui/layout/section";
import { PaperCrumpleStage } from "@repo/ui/motion/paper-crumple-stage";

import { PageNav } from "../agents/page-nav";
import { NotFoundCopy } from "./not-found-copy";

/* The 404 in the « Agents » direction: the bar on top, one cut sheet centred on a single screen, no footer. The sheet
   arrives crumpled and unfolds, and can be crumpled again; the message is real HTML over it. Under reduced motion or
   without WebGL2 the flat sheet shows with the message at once (the stage's fallback). */
export function NotFoundPage() {
  return (
    <Direction name="agents">
      <Cursor />
      <PageNav over="paper" />
      <main>
        <Section height="screen">
          <PageGrid>
            <GridArea columns={{ base: "all", md: 8, lg: 6 }}>
              <PaperCrumpleStage>
                <NotFoundCopy />
              </PaperCrumpleStage>
            </GridArea>
          </PageGrid>
        </Section>
      </main>
    </Direction>
  );
}
