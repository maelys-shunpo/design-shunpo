import { CiiSection } from "./cii-section";
import { MethodSection } from "./method-section";
import { QuestionsSection } from "./questions-section";
import { TestimonialsSection } from "./testimonials-section";

/* From the first step to the answers: the method and its call to book the Immersion, then the clients' own words as
   proof it works, the tax credit that eases the price, and the questions asked before starting. */
export function ConversionSections() {
  return (
    <>
      <MethodSection />
      <TestimonialsSection />
      <CiiSection />
      <QuestionsSection />
    </>
  );
}
