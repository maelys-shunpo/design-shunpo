import { Eyebrow } from "@repo/ui/agents/eyebrow";
import { Marquee } from "@repo/ui/agents/marquee";
import { GridArea } from "@repo/ui/layout/grid-area";
import { PageGrid } from "@repo/ui/layout/page-grid";
import { Section } from "@repo/ui/layout/section";
import { Text } from "@repo/ui/typography/text";

import { references } from "../shunpo/content";

/* A continuous band right under the hero: the label centred, the names running on every content column. */
export function ReferencesBand() {
  return (
    <Section spacing="tight" aria-label="Références">
      <PageGrid rows="md">
        <GridArea columns={{ md: 6, lg: 6 }} justify="center">
          <Eyebrow tone="ink">Ils nous ont confié des projets</Eyebrow>
        </GridArea>
        <GridArea>
          <Marquee label="Références" lap={30}>
            {references.map((reference) => (
              <Text key={reference.id} as="span" size="lg" weight="medium" tone="muted">
                {reference.name}
                {"        "}
              </Text>
            ))}
          </Marquee>
        </GridArea>
      </PageGrid>
    </Section>
  );
}
