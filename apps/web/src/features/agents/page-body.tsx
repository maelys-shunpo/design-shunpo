import { AgentsShowcase } from "./agents-showcase";
import { CasesSection } from "./cases-section";
import { ClosingSection } from "./closing-section";
import { ComposerSection } from "./composer-section";
import { DemoSection } from "./demo-section";
import { HeroSection } from "./hero-section";
import { MethodSection } from "./method-section";
import { QuestionsSection } from "./questions-section";
import { ReferencesBand } from "./references-band";
import { ToolsSection } from "./tools-section";

export function PageBody() {
  return (
    <main>
      <HeroSection />
      <DemoSection />
      <ReferencesBand />
      <AgentsShowcase />
      <ToolsSection />
      <MethodSection track="thread" />
      <MethodSection track="stack" />
      <CasesSection />
      <ComposerSection />
      <QuestionsSection />
      <ClosingSection />
    </main>
  );
}
