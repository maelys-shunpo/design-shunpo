import { HeroCopy } from "@repo/ui/instant/hero-copy";
import { StateCaptions } from "@repo/ui/instant/state-captions";
import { Text } from "@repo/ui/typography/text";

import { drawingStates, heroLead } from "./copy";
import { HeroIntro } from "./hero-intro";

/* What sits over the paper while the ink jumps. */
export function HeroCopyBlock() {
  return (
    <HeroCopy
      intro={<HeroIntro />}
      lead={
        <Text size="lg" tone="muted" measure="prose">
          {heroLead}
        </Text>
      }
      captions={<StateCaptions states={drawingStates} />}
    />
  );
}
