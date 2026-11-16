import { FilSection } from "@repo/ui/fil/fil-section";
import { FilStatement } from "@repo/ui/fil/fil-statement";
import { FilTitle } from "@repo/ui/fil/fil-title";
import { Container } from "@repo/ui/layout/container";
import { Stack } from "@repo/ui/layout/stack";

const statements = [
  { notThis: "Un agent IA", butThis: "Des tâches qui se font seules, chaque jour." },
  {
    notThis: "Un logiciel métier",
    butThis: "Une organisation qui ne perd plus de temps ni de visibilité.",
  },
  { notThis: "Un site web", butThis: "Des prospects, de la crédibilité et des ventes." },
];

export function TruthSection() {
  return (
    <FilSection ground="tenku" spacing="lg" thread="right">
      <Container>
        <Stack gap="2xl">
          <FilTitle level={2} size="display" data-fil-reveal>
            Ce que vous achetez vraiment.
          </FilTitle>
          <ul>
            {statements.map((statement) => (
              <FilStatement key={statement.notThis} {...statement} />
            ))}
          </ul>
        </Stack>
      </Container>
    </FilSection>
  );
}
