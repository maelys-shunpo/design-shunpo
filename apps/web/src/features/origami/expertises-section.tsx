import { Container } from "@repo/ui/layout/container";
import { Grid } from "@repo/ui/layout/grid";
import { Section } from "@repo/ui/layout/section";
import { Stack } from "@repo/ui/layout/stack";
import { Emphasis } from "@repo/ui/origami/emphasis";
import { ScopeList } from "@repo/ui/origami/scope-list";
import { Heading } from "@repo/ui/typography/heading";
import { Text } from "@repo/ui/typography/text";

import { expertises } from "@/features/shunpo/content";

/* The three kinds of folding SHUNPO does, after the story has shown how one piece is made. */
export function ExpertisesSection() {
  return (
    <Section id="expertises" spacing="xl">
      <Container size="wide">
        <Stack gap="3xl">
          <Stack gap="md">
            <Heading level={2} size="display">
              Trois familles de pliages, <Emphasis>une seule méthode.</Emphasis>
            </Heading>
            <Text size="lg" tone="muted" measure="prose">
              Selon votre besoin, la feuille devient un agent, un logiciel ou un site. Souvent les
              trois, l’un après l’autre.
            </Text>
          </Stack>
          <Grid columns="3" gap="xl" align="start">
            {expertises.map((expertise) => (
              <Stack key={expertise.id} gap="md">
                <Text size="sm" tone="muted">
                  {expertise.index}
                </Text>
                <Heading level={3} size="title">
                  {expertise.title}
                </Heading>
                <Text size="lg">{expertise.outcome}</Text>
                <Text tone="muted">{expertise.detail}</Text>
                <ScopeList
                  label={`Ce que couvre l’expertise ${expertise.index}`}
                  items={expertise.scope}
                />
              </Stack>
            ))}
          </Grid>
        </Stack>
      </Container>
    </Section>
  );
}
