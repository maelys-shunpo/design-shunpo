import { ClosingSection } from "./closing-section";
import { ExpertisesSection } from "./expertises-section";
import { Journey } from "./journey";
import { MethodSection } from "./method-section";
import { QuestionsSection } from "./questions-section";
import { ReferencesSection } from "./references-section";

/* The story of a piece of software told in paper first, then the editorial pages that carry it on: the
   expertises, the method, the references, the questions, the call. */
export function PageBody() {
  return (
    <main>
      <Journey />
      <ExpertisesSection />
      <MethodSection />
      <ReferencesSection />
      <QuestionsSection />
      <ClosingSection />
    </main>
  );
}
