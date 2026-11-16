import { Container } from "@repo/ui/layout/container";
import { Section } from "@repo/ui/layout/section";
import { Stack } from "@repo/ui/layout/stack";
import { BlueprintGrid } from "@repo/ui/mecanique/blueprint-grid";
import { DefectRow } from "@repo/ui/mecanique/defect-row";

import { symptoms } from "../shunpo/content";
import { SectionHeading } from "./section-heading";

export function DefectsSection() {
  return (
    <BlueprintGrid>
      <Section spacing="xl" id="defauts" aria-labelledby="defauts-titre">
        <Container size="wide">
          <Stack gap="2xl">
            <SectionHeading
              id="defauts-titre"
              label="Relevé 01 · Le constat"
              title="Votre entreprise tourne. Certains rouages grincent."
              lead="Six défauts que nous retrouvons d’un audit à l’autre. Aucun n’est grave seul. Ensemble, ils mangent des journées entières."
            />
            <Stack as="ol" gap="none">
              {symptoms.map((symptom, index) => (
                <DefectRow
                  key={symptom.id}
                  index={`Défaut ${String(index + 1).padStart(2, "0")}`}
                  title={symptom.title}
                  detail={symptom.detail}
                />
              ))}
            </Stack>
          </Stack>
        </Container>
      </Section>
    </BlueprintGrid>
  );
}
