import { AgentsAction } from "@repo/ui/agents/action";
import { Eyebrow } from "@repo/ui/agents/eyebrow";
import { Headline } from "@repo/ui/agents/headline";
import { Inline } from "@repo/ui/layout/inline";
import { Stack } from "@repo/ui/layout/stack";
import { Text } from "@repo/ui/typography/text";

import { contactUrl } from "../shunpo/content";

export function HeroCopy() {
  return (
    <Stack gap="xl" align="center">
      <Eyebrow align="center">Agents IA sur mesure</Eyebrow>
      <Headline level={1} size="display" align="center">
        Une interface pour faire travailler vos outils ensemble
      </Headline>
      <Text size="lg" align="center" measure="prose" tone="muted">
        SHUNPO crée une interface simple, reliée à votre messagerie, votre CRM et votre ERP. Vos
        agents IA font avancer les tâches dans ces outils. Depuis votre espace de travail, vous
        voyez ce qui a été fait et ce qui attend votre validation.
      </Text>
      <Inline gap="sm" justify="center">
        <AgentsAction href={contactUrl} size="lg" variant="signal" arrow>
          Réserver un diagnostic
        </AgentsAction>
        <AgentsAction href="#agents" size="lg" variant="outline">
          Voir un agent au travail
        </AgentsAction>
      </Inline>
    </Stack>
  );
}
