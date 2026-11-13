import { CiiSection } from "./cii-section";
import { MethodSection } from "./method-section";
import { QuestionsSection } from "./questions-section";

/* From the first step to the answers: the method and its call to book the Immersion, the tax credit that eases its
   price, then the questions asked before starting. */
export function ConversionSections() {
  return (
    <>
      <MethodSection />
      <CiiSection />
      <QuestionsSection />
    </>
  );
}
