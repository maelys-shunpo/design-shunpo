import { AgentsAction } from "@repo/ui/agents/action";
import { Inline } from "@repo/ui/layout/inline";

import { contactUrl } from "../shunpo/content";

/* The two calls right under the method: book the first conversation, or see an agent at work. */
export function MethodActions() {
  return (
    <Inline gap="sm">
      <AgentsAction href={contactUrl} size="lg" variant="signal" arrow>
        Réserver un diagnostic
      </AgentsAction>
      <AgentsAction href="#exemple" size="lg" variant="outline">
        Voir un agent au travail
      </AgentsAction>
    </Inline>
  );
}
