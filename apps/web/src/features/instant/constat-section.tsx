import { Entry } from "@repo/ui/instant/entry";
import { Reveal } from "@repo/ui/instant/reveal";
import { Spread } from "@repo/ui/instant/spread";
import { Container } from "@repo/ui/layout/container";
import { Section } from "@repo/ui/layout/section";
import { Stack } from "@repo/ui/layout/stack";

import { symptoms } from "../shunpo/content";
import { SectionHeading } from "./section-heading";

export function ConstatSection() {
  return (
    <Section id="constat" spacing="lg">
      <Container size="wide">
        <Spread
          hold
          margin={
            <SectionHeading
              place="margin"
              index="01"
              label="Le constat"
              title="Vos journées sont pleines de travail qui ne demande pas votre talent."
              lead="Ce n’est pas un manque d’organisation. Ce sont des gestes répétés chaque jour, des outils qui ne se parlent pas et des process qui tiennent à une seule personne."
            />
          }
        >
          <Reveal mode="sweep">
            <Stack as="ol" gap="none">
              {symptoms.map((symptom, index) => (
                <Entry
                  key={symptom.id}
                  index={String(index + 1).padStart(2, "0")}
                  title={symptom.title}
                >
                  {symptom.detail}
                </Entry>
              ))}
            </Stack>
          </Reveal>
        </Spread>
      </Container>
    </Section>
  );
}
