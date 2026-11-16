import { InkLink } from "@repo/ui/instant/ink-link";
import { SealLink } from "@repo/ui/instant/seal-link";
import { Inline } from "@repo/ui/layout/inline";
import { Stack } from "@repo/ui/layout/stack";
import { Heading } from "@repo/ui/typography/heading";
import { Text } from "@repo/ui/typography/text";

import { contactUrl, promise } from "../shunpo/content";
import { heroKicker, primaryAction } from "./copy";

/* The offer, first: who, what for, and the one action. */
export function HeroIntro() {
  return (
    <Stack gap="lg">
      <Text size="sm" tone="muted">
        {heroKicker}
      </Text>
      <Heading level={1} size="display-xl">
        {promise}
      </Heading>
      <Inline gap="lg">
        <SealLink href={contactUrl} label={primaryAction} size="lg" />
        <InkLink href="#references">Voir les références</InkLink>
      </Inline>
    </Stack>
  );
}
