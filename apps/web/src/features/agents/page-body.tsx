import { AgentsShowcase } from "./agents-showcase";
import { CasesSection } from "./cases-section";
import { ClosingSection } from "./closing-section";
import { ComposerSection } from "./composer-section";
import { HeroSection } from "./hero-section";
import { MethodSection } from "./method-section";
import { QuestionsSection } from "./questions-section";
import { ReferencesBand } from "./references-band";
import { ToolsSection } from "./tools-section";

export function PageBody() {
  return (
    <main>
      <HeroSection />
      <ReferencesBand />
      <AgentsShowcase />
      <ToolsSection />
      <MethodSection />
      <CasesSection />
      <ComposerSection />
      <QuestionsSection />
      <ClosingSection />
    </main>
  );
}
