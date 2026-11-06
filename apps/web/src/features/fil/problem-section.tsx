import { FilNode } from "@repo/ui/fil/fil-node";
import { FilSection } from "@repo/ui/fil/fil-section";
import { FilTitle } from "@repo/ui/fil/fil-title";
import { Container } from "@repo/ui/layout/container";
import { Grid } from "@repo/ui/layout/grid";
import { Stack } from "@repo/ui/layout/stack";
import { Text } from "@repo/ui/typography/text";

import { symptoms } from "../shunpo/content";

export function ProblemSection() {
  return (
    <FilSection id="probleme" ground="kome" spacing="lg" thread="enter">
      <Container>
        <Stack gap="3xl">
          <Stack gap="lg">
            <FilTitle level={2} size="display" data-fil-reveal>
              Chaque outil tire de son côté.
            </FilTitle>
            <Text size="lg" tone="muted" measure="prose">
              Votre entreprise fonctionne. Mais à mesure qu’elle grandit, le temps part dans les
              ressaisies, les allers-retours et les fichiers que personne d’autre ne sait tenir.
            </Text>
          </Stack>
          <Grid as="ol" columns="3" gap="2xl">
            {symptoms.map((symptom, index) => (
              <FilNode
                key={symptom.id}
                index={`0${index + 1}`}
                title={symptom.title}
                detail={symptom.detail}
              />
            ))}
          </Grid>
        </Stack>
      </Container>
    </FilSection>
  );
}
