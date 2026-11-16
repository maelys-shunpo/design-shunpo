import { FilButton } from "@repo/ui/fil/fil-button";
import { FilMark } from "@repo/ui/fil/fil-mark";
import { FilSection } from "@repo/ui/fil/fil-section";
import { FilTitle } from "@repo/ui/fil/fil-title";
import { Container } from "@repo/ui/layout/container";
import { Stack } from "@repo/ui/layout/stack";
import { Text } from "@repo/ui/typography/text";

import { contactUrl } from "../shunpo/content";

export function ClosingSection() {
  return (
    <FilSection ground="fuji" spacing="lg" thread="end">
      <Container>
        <Stack gap="2xl" align="center">
          <FilTitle level={2} size="mega" align="center">
            Tirons le premier <FilMark>fil</FilMark>.
          </FilTitle>
          <Text size="lg" tone="muted" align="center" measure="prose">
            Un diagnostic pour comprendre votre quotidien, repérer ce qui vous coûte le plus de
            temps et ce qu’il faudrait pour le régler. Vous repartez avec des priorités claires.
          </Text>
          <FilButton href={contactUrl} size="lg">
            Réserver un diagnostic
          </FilButton>
        </Stack>
      </Container>
    </FilSection>
  );
}
