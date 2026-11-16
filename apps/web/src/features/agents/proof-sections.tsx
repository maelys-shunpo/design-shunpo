import { CasesSection } from "./cases-section";
import { casesAreShown } from "./cases-visibility";
import { ReferencesBand } from "./references-band";

/* The proof, back to back, once the owner has seen what they would get: who trusted us and what they gained. Their own
   words (the testimonials) come later, after the method. */
export function ProofSections() {
  return (
    <>
      <ReferencesBand />
      {casesAreShown ? <CasesSection /> : null}
    </>
  );
}
