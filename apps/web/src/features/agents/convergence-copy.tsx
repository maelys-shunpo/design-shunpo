import { AgentsAction } from "@repo/ui/agents/action";
import { Eyebrow } from "@repo/ui/agents/eyebrow";
import { Headline } from "@repo/ui/agents/headline";
import { HeadlinePart } from "@repo/ui/agents/headline-part";
import { Inline } from "@repo/ui/layout/inline";
import { Stack } from "@repo/ui/layout/stack";
import { Text } from "@repo/ui/typography/text";

import { contactUrl } from "../shunpo/content";

/* The promise of the « Convergence » hero: the grey context, then the words the scene acts out. */
export function ConvergenceCopy() {
  return (
    <Stack gap="xl" align="center">
      <Eyebrow align="center">Agents IA sur mesure</Eyebrow>
      <Headline level={1} size="title" align="center">
        <HeadlinePart tone="dim">Une interface pour faire travailler </HeadlinePart>
        <HeadlinePart>vos outils ensemble</HeadlinePart>
      </Headline>
      <Text size="lg" align="center" measure="prose" tone="muted">
        Votre messagerie, votre CRM et votre ERP restent en place. Vos agents IA y font avancer les
        tâches, et vous suivez tout depuis un seul espace de travail.
      </Text>
      <Inline gap="sm" justify="center">
        <AgentsAction href={contactUrl} size="lg" variant="signal" arrow>
          Réserver un diagnostic
        </AgentsAction>
      </Inline>
    </Stack>
  );
}
