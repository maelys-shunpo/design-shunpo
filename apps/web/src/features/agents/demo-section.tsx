import { Eyebrow } from "@repo/ui/agents/eyebrow";
import { Headline } from "@repo/ui/agents/headline";
import { GridArea } from "@repo/ui/layout/grid-area";
import { PageGrid } from "@repo/ui/layout/page-grid";
import { Section } from "@repo/ui/layout/section";
import { Stack } from "@repo/ui/layout/stack";
import { Text } from "@repo/ui/typography/text";

import { demoRoles } from "./demo-roles";
import { HeroStage } from "./hero-stage";

/* The supplier invoice, told as an example: who acts, where, and the trace each step leaves. */
export function DemoSection() {
  return (
    <Section id="exemple" spacing="regular">
      <PageGrid rows="lg">
        <GridArea columns={{ md: { start: 1, span: 2 }, lg: { start: 1, span: 3 } }}>
          <Eyebrow>Exemple · une facture fournisseur</Eyebrow>
        </GridArea>
        <GridArea columns={{ md: { start: 3, span: 6 }, lg: { start: 4, span: 8 } }}>
          <Stack gap="lg">
            <Headline level={2} size="title">
              Un second cerveau pour votre équipe
            </Headline>
            <Text size="lg" tone="muted" measure="prose">
              L’agent retrouve l’information, prépare le travail dans vos outils et garde la trace
              de chaque étape. Quand une décision revient à quelqu’un, il le lui demande.
            </Text>
          </Stack>
        </GridArea>
        {demoRoles.map((role, index) => (
          <GridArea
            key={role.id}
            as="article"
            columns={{ md: "all", lg: { start: index * 4 + 1, span: 4 } }}
          >
            <Stack gap="sm">
              <Eyebrow tone={role.id === "claire" ? "signal" : "cobalt"}>
                {`${String(index + 1).padStart(2, "0")} · ${role.place}`}
              </Eyebrow>
              <Headline level={3} size="subtitle">
                {role.actor}
              </Headline>
              <Text tone="muted">{role.action}</Text>
              <Text size="sm" tone="muted">
                {role.trace}
              </Text>
            </Stack>
          </GridArea>
        ))}
        <GridArea as="figure">
          <HeroStage />
        </GridArea>
      </PageGrid>
    </Section>
  );
}
