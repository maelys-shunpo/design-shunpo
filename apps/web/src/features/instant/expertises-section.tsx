import { ExpertisePlate } from "@repo/ui/instant/expertise-plate";
import { FrameItem } from "@repo/ui/instant/frame-item";
import { FrameList } from "@repo/ui/instant/frame-list";
import { Reveal } from "@repo/ui/instant/reveal";
import { Container } from "@repo/ui/layout/container";
import { Section } from "@repo/ui/layout/section";
import { Stack } from "@repo/ui/layout/stack";

import { expertises } from "../shunpo/content";
import { SectionHeading } from "./section-heading";

export function ExpertisesSection() {
  return (
    <Section id="expertises" spacing="lg">
      <Container size="wide">
        <Stack gap="3xl">
          <SectionHeading
            index="03"
            label="Expertises"
            title="Trois expertises, un seul interlocuteur."
            lead="Elles se combinent : un process automatisé aujourd’hui, une application métier demain, un site connecté à votre CRM ensuite. Nous tenons toute la chaîne, du besoin au déploiement."
          />
          <Reveal mode="sweep">
            <FrameList>
              {expertises.map((expertise) => (
                <FrameItem key={expertise.id}>
                  <ExpertisePlate
                    index={expertise.index}
                    title={expertise.title}
                    outcome={expertise.outcome}
                    detail={expertise.detail}
                    scope={expertise.scope}
                    example={expertise.example}
                  />
                </FrameItem>
              ))}
            </FrameList>
          </Reveal>
        </Stack>
      </Container>
    </Section>
  );
}
