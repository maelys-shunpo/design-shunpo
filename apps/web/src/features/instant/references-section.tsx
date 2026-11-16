import { ReferenceRow } from "@repo/ui/instant/reference-row";
import { Reveal } from "@repo/ui/instant/reveal";
import { Container } from "@repo/ui/layout/container";
import { Section } from "@repo/ui/layout/section";
import { Stack } from "@repo/ui/layout/stack";

import { references } from "../shunpo/content";
import { SectionHeading } from "./section-heading";

export function ReferencesSection() {
  return (
    <Section id="references" spacing="lg">
      <Container size="wide">
        <Stack gap="3xl">
          <SectionHeading
            index="05"
            label="Références"
            title="Des projets sérieux, livrés et en production."
            lead="Du jeu télévisé en direct à la plateforme d’investissement : des contextes très différents, la même exigence. Chaque projet est détaillé sur shunpo.fr."
          />
          <Reveal mode="sweep">
            <Stack as="ul" gap="none">
              {references.map((reference) => (
                <li key={reference.id}>
                  <ReferenceRow
                    href={reference.href}
                    name={reference.name}
                    project={reference.project}
                    stake={reference.stake}
                  />
                </li>
              ))}
            </Stack>
          </Reveal>
        </Stack>
      </Container>
    </Section>
  );
}
