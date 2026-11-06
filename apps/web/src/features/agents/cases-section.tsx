import { CaseCard } from "@repo/ui/agents/case-card";
import { CaseRing } from "@repo/ui/agents/case-ring";
import { Eyebrow } from "@repo/ui/agents/eyebrow";
import { Headline } from "@repo/ui/agents/headline";
import { HeadlinePart } from "@repo/ui/agents/headline-part";
import { Container } from "@repo/ui/layout/container";
import { Section } from "@repo/ui/layout/section";
import { Stack } from "@repo/ui/layout/stack";

import { references } from "../shunpo/content";

const tones = ["ink", "signal", "paper", "cobalt", "sand"] as const;

export function CasesSection() {
  return (
    <Section id="references" spacing="lg">
      <Container size="wide">
        <Stack gap="2xl">
          <Stack gap="lg">
            <Eyebrow tone="ink">Références</Eyebrow>
            <Headline level={2} size="title">
              <HeadlinePart tone="dim">Des projets sérieux, </HeadlinePart>
              <HeadlinePart>livrés et utilisés.</HeadlinePart>
            </Headline>
          </Stack>
          <CaseRing
            label="Projets publiés"
            items={references.map((reference, index) => (
              <CaseCard
                key={reference.id}
                href={reference.href}
                client={reference.name}
                project={reference.project}
                stake={reference.stake}
                action="Lire le cas client"
                tone={tones[index % tones.length]}
              />
            ))}
          />
        </Stack>
      </Container>
    </Section>
  );
}
