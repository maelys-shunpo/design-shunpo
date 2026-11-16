import type { ReactNode } from "react";

import { ShunpoLogo } from "../brand/shunpo-logo.tsx";
import { Container } from "../layout/container.tsx";
import { Section } from "../layout/section.tsx";
import { Arrival } from "./arrival.tsx";

interface AgentsFooterProps {
  /* The footer links, as bar anchors (`NavAnchor`): shown in a row above the horizon. */
  links: ReactNode;
  /* Where the studio is, read on the right of the same row (e.g. « Lyon, France »). */
  place: ReactNode;
  /* The fine print at the foot: the copyright line and the legal link. */
  legal: ReactNode;
}

/* The home page's footer, « L'horizon » (DESIGN.md): the night of the closing runs on into a last dark band. One
   hairline carries the links and the place; under it the SHUNPO wordmark — its 瞬歩 seal above the S — rises from
   behind the horizon as the visitor reaches it, like the hero's sun, and holds, cropped by the foot of the page. The
   fine print rests below. The mark rises once through `Arrival` (no GSAP), and is painted in place under reduced
   motion. « L'horizon » carries no email: the footer signs, it does not open a second way to write. */
export function AgentsFooter({ links, place, legal }: AgentsFooterProps) {
  return (
    <Section as="footer" scheme="dark" overflow="clip" spacing="tight">
      <Container size="wide">
        <div className="flex flex-col gap-16 md:gap-24">
          <div className="flex flex-wrap items-baseline justify-between gap-x-10 gap-y-3 border-b border-border py-5">
            <nav aria-label="Pied de page" className="flex flex-wrap items-center gap-x-8 gap-y-2">
              {links}
            </nav>
            <div className="text-sm text-muted-foreground">{place}</div>
          </div>
          <Arrival mode="block" className="overflow-clip">
            <ShunpoLogo size="poster" className="translate-y-1/5 text-muted-foreground" />
          </Arrival>
          <div className="flex flex-wrap items-baseline justify-between gap-x-10 gap-y-2 text-sm text-muted-foreground">
            {legal}
          </div>
        </div>
      </Container>
    </Section>
  );
}
