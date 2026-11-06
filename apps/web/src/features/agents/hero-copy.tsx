import { AgentsAction } from "@repo/ui/agents/action";
import { Eyebrow } from "@repo/ui/agents/eyebrow";
import { Headline } from "@repo/ui/agents/headline";
import { HeadlinePart } from "@repo/ui/agents/headline-part";
import { Inline } from "@repo/ui/layout/inline";
import { Stack } from "@repo/ui/layout/stack";
import { Text } from "@repo/ui/typography/text";

import { contactUrl } from "../shunpo/content";

export function HeroCopy() {
  return (
    <Stack gap="xl" align="center">
      <Eyebrow align="center">Agence IA · agents, automatisations, logiciels</Eyebrow>
      <Headline level={1} size="display" align="center">
        <HeadlinePart tone="dim" block>
          Des agents IA
        </HeadlinePart>
        <HeadlinePart block>qui font le travail,</HeadlinePart>
        <HeadlinePart tone="dim">pas la </HeadlinePart>
        <HeadlinePart tone="ink">démo.</HeadlinePart>
      </Headline>
      <Text size="lg" align="center" measure="prose" tone="muted">
        SHUNPO conçoit, connecte et maintient des agents IA sur mesure. Ils lisent vos e-mails,
        remplissent vos outils, relancent vos clients, et passent la main à vos équipes quand une
        décision compte.
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
