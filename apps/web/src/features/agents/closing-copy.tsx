import { AgentsAction } from "@repo/ui/agents/action";
import { Headline } from "@repo/ui/agents/headline";
import { Stack } from "@repo/ui/layout/stack";

import { contactUrl } from "../shunpo/content";

export function ClosingCopy() {
  return (
    <Stack gap="xl" align="center">
      <Headline level={2} size="display" align="center">
        Le dernier logiciel dont vous aurez besoin
      </Headline>
      <AgentsAction href={contactUrl} size="lg" variant="signal" arrow>
        Parlons de votre projet
      </AgentsAction>
    </Stack>
  );
}
