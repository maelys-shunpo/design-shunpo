import { AgentsAction } from "@repo/ui/agents/action";
import { Calculator } from "@repo/ui/agents/calculator";
import { Headline } from "@repo/ui/agents/headline";
import { GridArea } from "@repo/ui/layout/grid-area";
import { PageGrid } from "@repo/ui/layout/page-grid";
import { Section } from "@repo/ui/layout/section";
import { Stack } from "@repo/ui/layout/stack";
import { Text } from "@repo/ui/typography/text";

import { contactUrl } from "../shunpo/content";
import { calculatorModel, hoursLeadIn } from "./calculator-content";

/* « Essayer » : the lost-hours calculator. The loss first, then the figure, then the Immersion. */
export function CalculatorSection() {
  return (
    <Section id="essayer" spacing="regular" tone="muted" paper="froisse">
      <PageGrid rows="lg">
        <GridArea columns={{ md: 8, lg: 8 }}>
          <Stack gap="lg" align="center">
            <Headline level={2} size="heading" align="center" entrance="lines">
              Combien d’heures perd votre entreprise ?
            </Headline>
            <Text size="lg" tone="muted" align="center" measure="prose">
              Onze questions, trois minutes, sans email. Vous voyez tout de suite le temps perdu
              chaque semaine, la part récupérable et ce qu’elle coûte.
            </Text>
          </Stack>
        </GridArea>
        <GridArea columns={{ md: 8, lg: 8 }}>
          <Calculator
            model={calculatorModel}
            hoursLeadIn={hoursLeadIn}
            reportCta={
              <AgentsAction href={contactUrl} variant="signal" size="md" arrow>
                Vérifier ces chiffres en Immersion
              </AgentsAction>
            }
          />
        </GridArea>
      </PageGrid>
    </Section>
  );
}
