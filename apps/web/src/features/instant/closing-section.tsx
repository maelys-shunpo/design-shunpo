import { SealLink } from "@repo/ui/instant/seal-link";
import { SealMark } from "@repo/ui/instant/seal-mark";
import { Container } from "@repo/ui/layout/container";
import { Grid } from "@repo/ui/layout/grid";
import { Section } from "@repo/ui/layout/section";
import { Stack } from "@repo/ui/layout/stack";
import { Heading } from "@repo/ui/typography/heading";
import { Text } from "@repo/ui/typography/text";

import { contactUrl } from "../shunpo/content";
import { primaryAction } from "./copy";

export function ClosingSection() {
  return (
    <Section scheme="dark" spacing="xl">
      <Container size="wide">
        <Grid columns="2" from="lg" gap="3xl" align="center">
          <Stack gap="xl" align="start">
            <Heading level={2} size="hero">
              Parlons de votre semaine.
            </Heading>
            <Text size="lg" tone="muted" measure="prose">
              Un premier échange pour repérer ce qui vous coûte le plus de temps, et ce qu’il
              faudrait pour le régler. Vous repartez avec des pistes claires, que vous travailliez
              avec nous ou non.
            </Text>
            <SealLink href={contactUrl} label={primaryAction} size="lg" />
          </Stack>
          <SealMark size="lg" />
        </Grid>
      </Container>
    </Section>
  );
}
