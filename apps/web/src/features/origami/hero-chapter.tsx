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
      index="01 · Le besoin"
      still={<Still plate="sheet" />}
      title={
        <Heading level={1} size="display-xl">
          Tout logiciel commence par une <Emphasis>feuille blanche.</Emphasis>
        </Heading>
      }
    >
      <Text size="lg" tone="muted">
        Votre besoin, vos process, vos outils. SHUNPO conçoit, développe et déploie les agents IA,
        les automatisations et les logiciels sur mesure qui rendent du temps à vos équipes.
      </Text>
      <Inline gap="md">
        <OrigamiLink href={contactUrl}>Réserver un diagnostic</OrigamiLink>
        <OrigamiLink href="#etapes" variant="outline">
          Voir les étapes
        </OrigamiLink>
      </Inline>
    </Chapter>
  );
}
