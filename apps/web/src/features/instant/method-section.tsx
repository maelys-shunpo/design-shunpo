import { MethodStep } from "@repo/ui/instant/method-step";
import { Reveal } from "@repo/ui/instant/reveal";
import { Container } from "@repo/ui/layout/container";
import { Grid } from "@repo/ui/layout/grid";
import { Section } from "@repo/ui/layout/section";
import { Stack } from "@repo/ui/layout/stack";

import { method } from "../shunpo/content";
import { kanjiFor } from "./copy";
import { SectionHeading } from "./section-heading";

export function MethodSection() {
  return (
    <Section id="methode" tone="muted" spacing="lg">
      <Container size="wide">
        <Stack gap="3xl">
          <SectionHeading
            index="04"
            label="Méthode"
            title="Observer, construire, transmettre. Dans cet ordre."
          />
          <Reveal mode="sweep">
            <Grid as="ol" columns="3" from="lg" gap="2xl">
              {method.map((step) => (
                <MethodStep
                  key={step.id}
                  index={step.index}
                  title={step.title}
                  kanji={kanjiFor(step.id).kanji}
                  kanjiLabel={kanjiFor(step.id).label}
                >
                  {step.detail}
                </MethodStep>
              ))}
            </Grid>
          </Reveal>
        </Stack>
      </Container>
    </Section>
  );
}
