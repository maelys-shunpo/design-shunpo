import { ClosingSection } from "./closing-section";
import { ExpertisesSection } from "./expertises-section";
import { KumihimoHero } from "./kumihimo-hero";
import { MethodSection } from "./method-section";
import { ProblemSection } from "./problem-section";
import { QuestionsSection } from "./questions-section";
import { ReferencesSection } from "./references-section";
import { TruthSection } from "./truth-section";

/* The bands of « Le fil », in the order the red thread runs through them. */
export function PageBody() {
  return (
    <main>
      <KumihimoHero />
      <ProblemSection />
      <TruthSection />
      <ExpertisesSection />
      <MethodSection />
      <ReferencesSection />
      <QuestionsSection />
      <ClosingSection />
    </main>
  );
}
