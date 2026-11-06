import { AgentsAction } from "@repo/ui/agents/action";
import { Headline } from "@repo/ui/agents/headline";
import { HeadlinePart } from "@repo/ui/agents/headline-part";
import { Stack } from "@repo/ui/layout/stack";
import { Text } from "@repo/ui/typography/text";

import { contactUrl } from "../shunpo/content";

export function ClosingCopy() {
  return (
    <Stack gap="xl" align="center">
      <Headline level={2} size="display" align="center">
        <HeadlinePart tone="dim" block>
          Gardez le jugement.
        </HeadlinePart>
        <HeadlinePart>Confiez la répétition.</HeadlinePart>
      </Headline>
      <Text size="lg" align="center" measure="prose">
        Un diagnostic pour repérer, dans votre quotidien, ce qu’un agent peut prendre en charge et
        ce que vous gagnez à le lui confier.
      </Text>
      <AgentsAction href={contactUrl} size="lg" variant="signal" arrow>
        Réserver un diagnostic
      </AgentsAction>
    </Stack>
  );
}
