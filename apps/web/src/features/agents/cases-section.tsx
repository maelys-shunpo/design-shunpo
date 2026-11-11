import { CaseCard } from "@repo/ui/agents/case-card";
import { CaseRing } from "@repo/ui/agents/case-ring";
import { Headline } from "@repo/ui/agents/headline";
import { GridArea } from "@repo/ui/layout/grid-area";
import { PageGrid } from "@repo/ui/layout/page-grid";
import { Section } from "@repo/ui/layout/section";
import { Stack } from "@repo/ui/layout/stack";

import { references } from "../shunpo/content";

const tones = ["ink", "signal", "paper", "cobalt", "sand"] as const;

/* Centred title on 10 columns, then the curved wall full bleed, from page edge to page edge. */
export function CasesSection() {
  return (
    <Section id="references" spacing="breath">
      <PageGrid rows="xl">
        <GridArea columns={{ md: 8, lg: 10 }}>
          <Stack gap="lg" align="center">
            <Headline level={2} size="title" align="center" entrance="lines">
              Des projets livrés et utilisés au quotidien
            </Headline>
          </Stack>
        </GridArea>
        <GridArea columns={{ md: "bleed", lg: "bleed" }}>
          <CaseRing
            label="Projets publiés"
            items={references.map((reference, index) => (
              <CaseCard
                key={reference.id}
                href={reference.href}
                client={reference.name}
                project={reference.project}
                stake={reference.stake}
                action="Lire le cas client"
                tone={tones[index % tones.length]}
              />
            ))}
          />
        </GridArea>
      </PageGrid>
    </Section>
  );
}
