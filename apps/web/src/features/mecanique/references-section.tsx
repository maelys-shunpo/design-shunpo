import { Container } from "@repo/ui/layout/container";
import { Section } from "@repo/ui/layout/section";
import { Stack } from "@repo/ui/layout/stack";
import { MecaniqueLink } from "@repo/ui/mecanique/mecanique-link";
import { ReferenceRow } from "@repo/ui/mecanique/reference-row";

import { casesUrl, references } from "../shunpo/content";
import { SectionHeading } from "./section-heading";

export function ReferencesSection() {
  return (
    <Section spacing="xl" tone="sheet" id="references" aria-labelledby="references-titre">
      <Container size="wide">
        <Stack gap="2xl">
          <SectionHeading
            id="references-titre"
            label="Archives 05 · Références"
            title="Des mécaniques qui tournent déjà."
            lead="Trafic massif, données sensibles, performance SEO : des projets de natures très différentes, pour des entreprises de toutes tailles."
          />
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
          <MecaniqueLink href={casesUrl} variant="quiet">
            Toutes les réalisations
          </MecaniqueLink>
        </Stack>
      </Container>
    </Section>
  );
}
