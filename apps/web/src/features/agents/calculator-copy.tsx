import { Arrival } from "@repo/ui/agents/arrival";
import { Headline } from "@repo/ui/agents/headline";
import { Stack } from "@repo/ui/layout/stack";
import { Text } from "@repo/ui/typography/text";

/* The calculator's title and the line that follows it in once the title has landed. */
export function CalculatorIntro() {
  return (
    <Stack gap="lg" align="center">
      <Headline level={2} size="heading" align="center" entrance="lines">
        Combien d’heures perd votre entreprise ?
      </Headline>
      <Arrival mode="follow">
        <Text size="lg" tone="muted" align="center" measure="prose">
          Onze questions, trois minutes, sans email. Vous voyez tout de suite le temps perdu chaque
          semaine, la part récupérable et ce qu’elle coûte.
        </Text>
      </Arrival>
    </Stack>
  );
}
