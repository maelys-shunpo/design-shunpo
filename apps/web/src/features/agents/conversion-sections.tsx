import { CalculatorSection } from "./calculator-section";
import { CiiSection } from "./cii-section";
import { MethodSection } from "./method-section";
import { TestimonialsSection } from "./testimonials-section";

/* From the first step to the answers: the method and its call to book the Immersion, then the clients' own words as
   proof it works, the tax credit that eases the price, and the questionnaire that measures their own lost hours. The
   questions themselves are read inside the closing coupe, which cuts from them to the final call. */
export function ConversionSections() {
  return (
    <>
      <MethodSection />
      <TestimonialsSection />
      <CiiSection />
      <CalculatorSection />
    </>
  );
}
