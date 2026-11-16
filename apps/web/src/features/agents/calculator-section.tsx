import { AgentsAction } from "@repo/ui/agents/action";
import { Arrival } from "@repo/ui/agents/arrival";
import { Calculator } from "@repo/ui/agents/calculator";
import { GridArea } from "@repo/ui/layout/grid-area";
import { PageGrid } from "@repo/ui/layout/page-grid";
import { Section } from "@repo/ui/layout/section";

import { contactUrl } from "../shunpo/content";
import { calculatorModel, hoursLeadIn } from "./calculator-content";
import { CalculatorIntro } from "./calculator-copy";

/* « Essayer » : the lost-hours calculator. The loss first, then the figure, then the Immersion. */
export function CalculatorSection() {
  return (
    <Section id="essayer" spacing="regular" tone="muted" paper="froisse">
      <PageGrid rows="lg">
        <GridArea columns={{ md: 8, lg: 8 }}>
          <CalculatorIntro />
        </GridArea>
        <GridArea columns={{ md: 8, lg: 8 }}>
          <Arrival mode="block">
            <Calculator
              model={calculatorModel}
              hoursLeadIn={hoursLeadIn}
              reportCta={
                <AgentsAction href={contactUrl} variant="signal" size="md" arrow>
                  Vérifier ces chiffres en Immersion
                </AgentsAction>
              }
            />
          </Arrival>
        </GridArea>
      </PageGrid>
    </Section>
  );
}
