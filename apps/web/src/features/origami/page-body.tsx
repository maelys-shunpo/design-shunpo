import { ClosingSection } from "./closing-section";
import { Journey } from "./journey";
import { MethodSection } from "./method-section";
import { QuestionsSection } from "./questions-section";
import { ReferencesSection } from "./references-section";

/* The studio journey first, then the editorial pages: the method, the references, the questions, the call. */
export function PageBody() {
  return (
    <main>
      <Journey />
      <MethodSection />
      <ReferencesSection />
      <QuestionsSection />
      <ClosingSection />
    </main>
  );
}
