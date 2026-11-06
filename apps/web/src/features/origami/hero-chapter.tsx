import { Inline } from "@repo/ui/layout/inline";
import { Chapter } from "@repo/ui/origami/chapter";
import { Emphasis } from "@repo/ui/origami/emphasis";
import { OrigamiLink } from "@repo/ui/origami/origami-link";
import { Heading } from "@repo/ui/typography/heading";
import { Text } from "@repo/ui/typography/text";

import { contactUrl } from "@/features/shunpo/content";

import { Still } from "./stills";

export function HeroChapter() {
  return (
    <Chapter
      place="hero"
      still={<Still plate="sheet" />}
      index="Agence IA · automatisation · logiciels sur mesure"
      title={
        <Heading level={1} size="display-xl">
          Pliez le travail. <Emphasis>Dépliez</Emphasis> le temps.
        </Heading>
      }
    >
      <Text size="lg" tone="muted">
        Agents IA, automatisations et logiciels sur mesure. Nous transformons ce qui vous prend des
        heures en systèmes qui tournent seuls, à Lyon et partout en France.
      </Text>
      <Inline gap="md">
        <OrigamiLink href={contactUrl}>Réserver un diagnostic</OrigamiLink>
        <OrigamiLink href="#expertises" variant="outline">
          Voir les expertises
        </OrigamiLink>
      </Inline>
    </Chapter>
  );
}
