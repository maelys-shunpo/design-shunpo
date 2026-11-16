import { AgentsAction } from "@repo/ui/agents/action";
import { Eyebrow } from "@repo/ui/agents/eyebrow";
import { Headline } from "@repo/ui/agents/headline";
import { HeadlinePart } from "@repo/ui/agents/headline-part";
import { Inline } from "@repo/ui/layout/inline";
import { Stack } from "@repo/ui/layout/stack";
import { Text } from "@repo/ui/typography/text";

import { contactUrl } from "../shunpo/content";

/* The promise of the « Pliage » hero, held beside the sheets while they fold. The call is in ink here: the
   folded sign carries the screen's one Fushimi, its pebble. */
export function PliageCopy() {
  return (
    <Stack gap="xl">
      <Eyebrow>Agents IA sur mesure</Eyebrow>
      <Headline level={1} size="title">
        <HeadlinePart tone="dim">Vos outils, </HeadlinePart>
        <HeadlinePart>un seul système.</HeadlinePart>
      </Headline>
      <Text size="lg" tone="muted" measure="prose">
        Votre messagerie, votre CRM, votre ERP et vos tableurs restent en place. SHUNPO les relie
        dans une seule interface où vos agents IA font avancer les tâches, et vous validez ce qui
        compte.
      </Text>
      <Inline gap="sm">
        <AgentsAction href={contactUrl} size="lg" variant="solid" arrow>
          Réserver un diagnostic
        </AgentsAction>
      </Inline>
    </Stack>
  );
}
