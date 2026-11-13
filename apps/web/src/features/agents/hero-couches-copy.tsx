import { AgentsAction } from "@repo/ui/agents/action";
import { Eyebrow } from "@repo/ui/agents/eyebrow";
import { Headline } from "@repo/ui/agents/headline";
import { HeadlinePart } from "@repo/ui/agents/headline-part";
import { Inline } from "@repo/ui/layout/inline";
import { Stack } from "@repo/ui/layout/stack";
import { Text } from "@repo/ui/typography/text";

import { contactUrl } from "../shunpo/content";

/* The promise above the interface: grey context, then the words that matter. */
export function CouchesPromise() {
  return (
    <Stack gap="lg" align="center">
      <Eyebrow align="center">Agents IA sur mesure</Eyebrow>
      <Headline level={1} size="title" align="center">
        <HeadlinePart tone="dim" block>
          Une interface pour faire travailler
        </HeadlinePart>
        <HeadlinePart block>vos outils ensemble</HeadlinePart>
      </Headline>
      <Text size="lg" align="center" measure="prose" tone="muted">
        Vos agents IA agissent dans votre messagerie, votre CRM et votre ERP. Vous suivez tout
        depuis un seul espace, et vous validez ce qui compte.
      </Text>
      <Inline gap="sm" justify="center">
        <AgentsAction href={contactUrl} size="lg" variant="signal" arrow>
          Réserver un diagnostic
        </AgentsAction>
      </Inline>
    </Stack>
  );
}

/* Under the finished interface: the promise closed, and the way in. */
export function CouchesOutro() {
  return (
    <Stack gap="md" align="center">
      <Text size="lg" align="center" measure="prose">
        Votre interface, reliée à vos outils, avec vos règles.
      </Text>
      <AgentsAction href={contactUrl} size="lg" variant="signal" arrow>
        Réserver un diagnostic
      </AgentsAction>
    </Stack>
  );
}
