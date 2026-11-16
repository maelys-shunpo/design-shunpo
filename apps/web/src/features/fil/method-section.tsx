import { FilSection } from "@repo/ui/fil/fil-section";
import { FilStep } from "@repo/ui/fil/fil-step";
import { FilSteps } from "@repo/ui/fil/fil-steps";
import { FilTitle } from "@repo/ui/fil/fil-title";
import { Container } from "@repo/ui/layout/container";
import { Stack } from "@repo/ui/layout/stack";
import { Text } from "@repo/ui/typography/text";

import { method } from "../shunpo/content";

export function MethodSection() {
  return (
    <FilSection id="methode" ground="kome" spacing="lg" thread="right">
      <Container>
        <Stack gap="3xl">
          <Stack gap="lg">
            <FilTitle level={2} size="display" data-fil-reveal>
              Trois gestes, dans cet ordre.
            </FilTitle>
            <Text size="lg" tone="muted" measure="prose">
              Pas d’outil avant d’avoir compris. Pas de mise en production sans tests. Pas de
              livraison sans une équipe qui sait s’en servir.
            </Text>
          </Stack>
          <FilSteps>
            {method.map((step) => (
              <FilStep key={step.id} index={step.index} title={step.title} detail={step.detail} />
            ))}
          </FilSteps>
        </Stack>
      </Container>
    </FilSection>
  );
}
