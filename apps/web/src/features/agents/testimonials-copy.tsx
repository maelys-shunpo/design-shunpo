import { AgentsAction } from "@repo/ui/agents/action";
import { Arrival } from "@repo/ui/agents/arrival";
import { Headline } from "@repo/ui/agents/headline";
import { Stack } from "@repo/ui/layout/stack";
import { Text } from "@repo/ui/typography/text";

import { ratings, trustpilotUrl } from "../shunpo/testimonials";

/* The title of the clients' words, their ratings and where to read the rest. */
export function TestimonialsCopy() {
  return (
    <Stack gap="lg" align="center">
      <Headline level={2} size="title" align="center" entrance="lines">
        Ce que nos clients en disent
      </Headline>
      <Arrival mode="follow">
        <Stack gap="lg" align="center">
          <Text size="lg" tone="muted" measure="prose" align="center">
            {`${ratings.trustpilot} sur Trustpilot, ${ratings.malt} sur Malt.`}
          </Text>
          <AgentsAction href={trustpilotUrl} variant="quiet" arrow>
            Lire les avis Trustpilot
          </AgentsAction>
        </Stack>
      </Arrival>
    </Stack>
  );
}
