import { Headline } from "@repo/ui/agents/headline";
import { HeadlinePart } from "@repo/ui/agents/headline-part";
import { HeroConvergence as Scene } from "@repo/ui/agents/hero-convergence";
import { Section } from "@repo/ui/layout/section";

import { ConvergenceCopy } from "./convergence-copy";
import { convergenceTools } from "./convergence-tools";

/* Hero proposal « Convergence »: the windows of today's tools fly into one SHUNPO workspace as the page scrolls. */
export function HeroConvergence() {
  return (
    <Section spacing="flush">
      <Scene
        copy={<ConvergenceCopy />}
        workspace={{
          title: "Espace de travail",
          context: "SHUNPO · lundi matin",
          status: "Agents en service",
        }}
        tools={convergenceTools}
        caption={
          <Headline level={2} size="subtitle" align="center">
            <HeadlinePart tone="dim">Vous validez ce qui compte. </HeadlinePart>
            <HeadlinePart>Le reste avance seul.</HeadlinePart>
          </Headline>
        }
      />
    </Section>
  );
}
