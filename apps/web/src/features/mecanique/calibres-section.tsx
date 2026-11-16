import { Container } from "@repo/ui/layout/container";
import { Grid } from "@repo/ui/layout/grid";
import { Section } from "@repo/ui/layout/section";
import { Stack } from "@repo/ui/layout/stack";

import { expertises } from "../shunpo/content";
import { CalibreCard } from "./calibre-card";
import { SectionHeading } from "./section-heading";

export function CalibresSection() {
  return (
    <Section spacing="xl" id="calibres" aria-labelledby="calibres-titre">
      <Container size="wide">
        <Stack gap="2xl">
          <SectionHeading
            id="calibres-titre"
            label="Planche 03 · Expertises"
            title="Trois savoir-faire, un seul mouvement."
            lead="Ils se commandent séparément ou s’assemblent. Une entreprise commence souvent par automatiser un process, puis construit l’application qui va avec."
          />
          <Grid as="ul" columns="3" from="lg" gap="lg">
            {expertises.map((expertise) => (
              <CalibreCard key={expertise.id} expertise={expertise} />
            ))}
          </Grid>
        </Stack>
      </Container>
    </Section>
  );
}
