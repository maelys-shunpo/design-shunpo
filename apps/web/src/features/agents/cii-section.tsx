import { Headline } from "@repo/ui/agents/headline";
import { GridArea } from "@repo/ui/layout/grid-area";
import { PageGrid } from "@repo/ui/layout/page-grid";
import { Section } from "@repo/ui/layout/section";

import { ciiCopy } from "./cii-content";
import { CiiCookie } from "./cii-cookie";

/* A pause: the window's height of its own, everything centred on one axis, the title on one line from laptops (ten
   columns) over the cookie hiding the 20 % (eight). The cookie, larger on phones, runs its white margins past the screen's edges: the section
   clips them. */
export function CiiSection() {
  return (
    <Section id="credit-impot" height="screen" overflow="clip" aria-labelledby="credit-impot-title">
      <PageGrid rows="md">
        <GridArea columns={{ md: 8, lg: 10 }}>
          <Headline
            level={2}
            id="credit-impot-title"
            size="heading"
            align="center"
            entrance="lines"
          >
            {ciiCopy.title}
          </Headline>
        </GridArea>
        <GridArea columns={{ md: 8, lg: 8 }}>
          <CiiCookie />
        </GridArea>
      </PageGrid>
    </Section>
  );
}
