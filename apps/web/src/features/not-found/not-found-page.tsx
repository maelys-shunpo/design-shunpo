import { Cursor } from "@repo/ui/agents/cursor";
import { Surface } from "@repo/ui/agents/surface";
import { Direction } from "@repo/ui/layout/direction";
import { GridArea } from "@repo/ui/layout/grid-area";
import { PageGrid } from "@repo/ui/layout/page-grid";
import { Section } from "@repo/ui/layout/section";

import { PageNav } from "../agents/page-nav";
import { NotFoundCopy } from "./not-found-copy";

/* The 404 in the « Agents » direction: the bar on top, one cut sheet centred on a single screen, no footer. The flat
   sheet with the copy is the first paint and the reduced-motion / no-WebGL2 fallback; Task 4 lays the crumpling 3D
   sheet over it. */
export function NotFoundPage() {
  return (
    <Direction name="agents">
      <Cursor />
      <PageNav over="paper" />
      <main>
        <Section height="screen">
          <PageGrid>
            <GridArea columns={{ base: "all", md: 8, lg: 6 }}>
              <Surface paper="paper" cut="lg" shadow="lift" pad="lg">
                <NotFoundCopy />
              </Surface>
            </GridArea>
          </PageGrid>
        </Section>
      </main>
    </Direction>
  );
}
