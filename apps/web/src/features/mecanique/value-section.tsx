import { Container } from "@repo/ui/layout/container";
import { Section } from "@repo/ui/layout/section";
import { Stack } from "@repo/ui/layout/stack";
import { TradeRow } from "@repo/ui/mecanique/trade-row";

import { SectionHeading } from "./section-heading";

const trades = [
  { id: "agent", instead: "Un agent IA", outcome: "Des tâches prises en charge sans vous" },
  { id: "logiciel", instead: "Un logiciel métier", outcome: "Une organisation qui voit clair" },
  {
    id: "automatisation",
    instead: "Une automatisation",
    outcome: "Moins de saisies, moins d’erreurs",
  },
  { id: "site", instead: "Un site web", outcome: "Des prospects et de la crédibilité" },
] as const;

export function ValueSection() {
  return (
    <Section spacing="lg" tone="sheet">
      <Container size="wide">
        <Stack gap="2xl">
          <SectionHeading
            label="Relevé 02 · Ce que vous achetez"
            title="La technologie est le moyen. Le temps est le résultat."
          />
          <dl>
            {trades.map((trade) => (
              <TradeRow key={trade.id} instead={trade.instead} outcome={trade.outcome} />
            ))}
          </dl>
        </Stack>
      </Container>
    </Section>
  );
}
