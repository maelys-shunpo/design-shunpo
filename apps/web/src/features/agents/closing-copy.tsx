import { AgentsAction } from "@repo/ui/agents/action";
import { Headline } from "@repo/ui/agents/headline";
import { Stack } from "@repo/ui/layout/stack";
import { Text } from "@repo/ui/typography/text";

import { contactUrl } from "../shunpo/content";

export function ClosingCopy() {
  return (
    <Stack gap="xl" align="center">
      <Headline level={2} size="display" align="center">
        Commençons par une tâche qui vous prend du temps
      </Headline>
      <Text size="lg" align="center" measure="prose">
        Le diagnostic est un premier échange pour comprendre votre situation. Si un projet a du
        sens, il commence par l’Immersion.
      </Text>
      <AgentsAction href={contactUrl} size="lg" variant="signal" arrow>
        Réserver un diagnostic
      </AgentsAction>
    </Stack>
  );
}
