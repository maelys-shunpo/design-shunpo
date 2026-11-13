import { CoverSheet } from "@repo/ui/agents/cover-sheet";
import type { ReactNode } from "react";

import { CalculatorSection } from "./calculator-section";
import { ClosingSection } from "./closing-section";
import { ConversionSections } from "./conversion-sections";
import { OsSection } from "./os-section";
import { ProblemSection } from "./problem-section";
import { ProofSections } from "./proof-sections";
import { ToolsSection } from "./tools-section";

/* The order a PME owner reads in: their problem, what they would get (the Monday screen), that it runs on the tools
   they already have, their own task, then the proof, how it starts and what it costs, and the call. */
function Sections() {
  return (
    <>
      <ProblemSection />
      <OsSection />
      <ToolsSection />
      <CalculatorSection />
      <ProofSections />
      <ConversionSections />
      <ClosingSection />
    </>
  );
}

interface PageBodyProps {
  /* The opening section from the route: the live hero, or a hero proposal under review. */
  hero: ReactNode;
  /* A film stays under the page, which rises over it as one sheet of paper. */
  opening: "paper" | "film";
}

export function PageBody({ hero, opening }: PageBodyProps) {
  return (
    <main>
      {hero}
      {opening === "film" ? (
        <CoverSheet>
          <Sections />
        </CoverSheet>
      ) : (
        <Sections />
      )}
    </main>
  );
}
