import { CoverSheet } from "@repo/ui/agents/cover-sheet";
import type { ReactNode } from "react";

import { ClosingSection } from "./closing-section";
import { ConversionSections } from "./conversion-sections";
import { OsSection } from "./os-section";
import { PageFooter } from "./page-footer";
import { ProblemSection } from "./problem-section";
import { ProofSections } from "./proof-sections";
import { ToolsSection } from "./tools-section";

/* The order a PME owner reads in: their problem, what they would get (the Monday screen), that it runs on the tools
   they already have, then the proof, how it starts, what it costs, their own lost hours, and the call. */
function Sections() {
  return (
    <>
      <ProblemSection />
      <OsSection />
      <ToolsSection />
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
  /* The footer sits inside the risen sheet, a sibling of the sections (not nested in one, so it stays the page's
     `contentinfo` landmark): on a film opening this keeps it above the held Fuji Night dusk veil (`agents-cover-dusk`,
     fixed and over everything below the z-10 sheet) and butted against the closing, instead of under the veil in the
     dark with a cream band above it. */
  return (
    <main>
      {hero}
      {opening === "film" ? (
        <CoverSheet>
          <Sections />
          <PageFooter />
        </CoverSheet>
      ) : (
        <>
          <Sections />
          <PageFooter />
        </>
      )}
    </main>
  );
}
