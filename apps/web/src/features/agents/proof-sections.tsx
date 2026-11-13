import { CasesSection } from "./cases-section";
import { casesAreShown } from "./cases-visibility";
import { ReferencesBand } from "./references-band";
import { TestimonialsSection } from "./testimonials-section";

/* The proof, back to back, once the owner has seen what they would get: who trusted us, what they gained, their own
   words. */
export function ProofSections() {
  return (
    <>
      <ReferencesBand />
      {casesAreShown ? <CasesSection /> : null}
      <TestimonialsSection />
    </>
  );
}
