import { AgentsAction } from "@repo/ui/agents/action";
import { Eyebrow } from "@repo/ui/agents/eyebrow";
import { Headline } from "@repo/ui/agents/headline";
import { Stack } from "@repo/ui/layout/stack";
import { Text } from "@repo/ui/typography/text";

import { ratings, trustpilotUrl } from "../shunpo/testimonials";

/* The title of the clients' words, their ratings and where to read the rest. */
export function TestimonialsCopy() {
  return (
    <Stack gap="lg" align="start">
      <Eyebrow>Avis clients</Eyebrow>
      <Headline level={2} size="title">
        Ce que nos clients en disent
      </Headline>
      <Text size="lg" tone="muted" measure="prose">
        {`${ratings.trustpilot} sur Trustpilot, ${ratings.malt} sur Malt.`}
      </Text>
      <AgentsAction href={trustpilotUrl} variant="quiet" arrow>
        Lire les avis Trustpilot
      </AgentsAction>
    </Stack>
  );
}
