import { AgentsShowcase } from "./agents-showcase";
import { ClosingSection } from "./closing-section";
import { ComposerSection } from "./composer-section";
import { HeroSection } from "./hero-section";
import { MethodSection } from "./method-section";
import { ProblemSection } from "./problem-section";
import { ProofSections } from "./proof-sections";
import { QuestionsSection } from "./questions-section";
import { ReferencesBand } from "./references-band";
import { ToolsSection } from "./tools-section";

export function PageBody() {
  return (
    <main>
      <HeroSection />
      <ProblemSection />
      <ReferencesBand />
      <AgentsShowcase />
      <ToolsSection />
      <MethodSection />
      <ProofSections />
      <ComposerSection />
      <QuestionsSection />
      <ClosingSection />
    </main>
  );
}
