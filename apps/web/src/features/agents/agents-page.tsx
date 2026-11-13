import { Direction } from "@repo/ui/layout/direction";
import { PaperGate } from "@repo/ui/lib/paper-gate";
import type { ReactNode } from "react";

import { PageBody } from "./page-body";
import { PageFooter } from "./page-footer";
import { PageNav } from "./page-nav";

interface AgentsPageProps {
  /* The opening section: the live hero, or a hero proposal under review. */
  hero: ReactNode;
  /* What the hero is: a section on the paper, or a film (`HeroFilm`) the bar lies over and the rest of the page
     rises over. */
  opening?: "paper" | "film";
}

/* The « Agents » page around its opening section. */
export function AgentsPage({ hero, opening = "paper" }: AgentsPageProps) {
  return (
    <Direction name="agents">
      <PaperGate />
      <PageNav over={opening} />
      <PageBody hero={hero} opening={opening} />
      <PageFooter />
    </Direction>
  );
}
