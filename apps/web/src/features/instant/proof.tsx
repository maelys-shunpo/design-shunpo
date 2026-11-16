import { ClosingSection } from "./closing-section";
import { ConvictionSection } from "./conviction-section";
import { QuestionsSection } from "./questions-section";
import { ReferencesSection } from "./references-section";

/* The second half: the references, the conviction, the answers, then the call to talk. */
export function Proof() {
  return (
    <>
      <ReferencesSection />
      <ConvictionSection />
      <QuestionsSection />
      <ClosingSection />
    </>
  );
}
