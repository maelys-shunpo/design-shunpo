import { AgentsAction } from "@repo/ui/agents/action";
import { Eyebrow } from "@repo/ui/agents/eyebrow";
import { Headline } from "@repo/ui/agents/headline";
import { HeadlinePart } from "@repo/ui/agents/headline-part";
import { Inline } from "@repo/ui/layout/inline";
import { Stack } from "@repo/ui/layout/stack";
import { Text } from "@repo/ui/typography/text";

import { contactUrl } from "../shunpo/content";

/* The promise of « Le signe plié »: the grey context, then the words the sign folds into. The Fushimi of the
   screen is the sign's pebble, so the call to action is set in ink here. */
export function HeroShurikenCopy() {
  return (
    <Stack gap="xl">
      <Eyebrow>Agents IA sur mesure</Eyebrow>
      <Headline level={1} size="title">
        <HeadlinePart tone="dim">Vos outils, </HeadlinePart>
        <HeadlinePart>un seul système.</HeadlinePart>
      </Headline>
      <Text size="lg" tone="muted" measure="prose">
        SHUNPO relie votre messagerie, votre CRM, votre ERP et vos tableurs à une seule interface.
        Vos agents IA y font avancer les tâches, vous validez ce qui compte.
      </Text>
      <Inline gap="sm">
        <AgentsAction href={contactUrl} size="lg" arrow>
          Réserver un diagnostic
        </AgentsAction>
      </Inline>
    </Stack>
  );
}
