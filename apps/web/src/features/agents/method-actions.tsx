import { AgentsAction } from "@repo/ui/agents/action";
import { Inline } from "@repo/ui/layout/inline";

import { contactUrl } from "../shunpo/content";

/* The call right under the method: book the first conversation. */
export function MethodActions() {
  return (
    <Inline gap="sm">
      <AgentsAction href={contactUrl} size="lg" variant="signal" arrow>
        Réserver un diagnostic
      </AgentsAction>
    </Inline>
  );
}
