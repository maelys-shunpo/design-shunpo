import { FilExpertise } from "@repo/ui/fil/fil-expertise";
import { FilSection } from "@repo/ui/fil/fil-section";
import { FilTitle } from "@repo/ui/fil/fil-title";
import { Container } from "@repo/ui/layout/container";
import { Stack } from "@repo/ui/layout/stack";
import { Text } from "@repo/ui/typography/text";

import { expertises } from "../shunpo/content";

const grounds = ["paper", "tenku", "ink"] as const;

export function ExpertisesSection() {
  return (
    <FilSection id="expertises" ground="shiro" spacing="lg" thread="left">
      <Container>
        <Stack gap="3xl">
          <Stack gap="lg">
            <FilTitle level={2} size="display" data-fil-reveal>
              Trois savoir-faire, une seule tresse.
            </FilTitle>
            <Text size="lg" tone="muted" measure="prose">
              Automatiser un process, construire l’application qui manque, connecter votre site à
              vos outils commerciaux : chacun se commande seul, et tous se nouent ensemble.
            </Text>
          </Stack>
          <Stack gap="xl">
            {expertises.map((expertise, index) => (
              <FilExpertise
                key={expertise.id}
                ground={grounds[index]}
                index={expertise.index}
                title={expertise.title}
                outcome={expertise.outcome}
                detail={expertise.detail}
                scope={expertise.scope}
                example={expertise.example}
              />
            ))}
          </Stack>
        </Stack>
      </Container>
    </FilSection>
  );
}
