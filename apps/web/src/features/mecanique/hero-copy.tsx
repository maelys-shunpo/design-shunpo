import { Inline } from "@repo/ui/layout/inline";
import { Stack } from "@repo/ui/layout/stack";
import { MecaniqueLink } from "@repo/ui/mecanique/mecanique-link";
import { SpecLabel } from "@repo/ui/mecanique/spec-label";
import { Heading } from "@repo/ui/typography/heading";
import { Text } from "@repo/ui/typography/text";

import { casesUrl, contactUrl } from "../shunpo/content";

export function HeroCopy() {
  return (
    <Stack gap="lg" data-scene-item="hero-copy">
      <SpecLabel rule tone="signal">
        Agence IA et automatisation · Lyon
      </SpecLabel>
      <Heading level={1} size="display">
        Une mécanique qui tourne seule.
      </Heading>
      <Text size="lg" tone="muted" measure="prose">
        IA, automatisations, logiciels sur mesure : nous assemblons les rouages qui font tourner vos
        opérations. Vos équipes récupèrent le temps passé à recopier, relancer et chercher.
      </Text>
      <Inline gap="md">
        <MecaniqueLink href={contactUrl}>Réserver un diagnostic</MecaniqueLink>
        <MecaniqueLink href={casesUrl} variant="outline">
          Voir les réalisations
        </MecaniqueLink>
      </Inline>
    </Stack>
  );
}
