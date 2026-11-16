import { FilButton } from "@repo/ui/fil/fil-button";
import { FilLink } from "@repo/ui/fil/fil-link";
import { FilTitle } from "@repo/ui/fil/fil-title";
import { Inline } from "@repo/ui/layout/inline";
import { Text } from "@repo/ui/typography/text";

import { casesUrl, contactUrl } from "../shunpo/content";

/* The message of the first window, shared by the live hero and its reduced-motion page. */
export function HeroCopy() {
  return (
    <>
      <FilTitle level={1} size="hero">
        Démêlez votre quotidien.
      </FilTitle>
      <Text size="lg" measure="prose">
        SHUNPO vous libère du temps. Nous relions vos outils, automatisons ce qui se répète et
        construisons les logiciels qui vous manquent, pour que tout tienne en une seule tresse.
      </Text>
      <Inline gap="lg">
        <FilButton href={contactUrl} tone="red" size="lg">
          Réserver un diagnostic
        </FilButton>
        <FilLink href={casesUrl}>Voir nos réalisations</FilLink>
      </Inline>
    </>
  );
}
