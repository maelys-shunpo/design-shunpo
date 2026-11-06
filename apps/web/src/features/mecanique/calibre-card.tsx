import { Stack } from "@repo/ui/layout/stack";
import { BlueprintFrame } from "@repo/ui/mecanique/blueprint-frame";
import { SpecLabel } from "@repo/ui/mecanique/spec-label";
import { Heading } from "@repo/ui/typography/heading";
import { Text } from "@repo/ui/typography/text";

import type { Expertise } from "../shunpo/content";

interface CalibreCardProps {
  expertise: Expertise;
}

/* One expertise drawn as a calibre's data sheet: its result first, its scope as a parts list, an example. */
export function CalibreCard({ expertise }: CalibreCardProps) {
  return (
    <BlueprintFrame as="li" padding="lg">
      <Stack gap="xl">
        <Stack gap="sm">
          <SpecLabel tone="signal">Calibre {expertise.index}</SpecLabel>
          <Heading level={3} size="title-sm">
            {expertise.title}
          </Heading>
        </Stack>
        <Text size="lg" weight="medium">
          {expertise.outcome}
        </Text>
        <Text tone="muted">{expertise.detail}</Text>
        <Stack as="ul" gap="xs" aria-label={`Ce que comprend le calibre ${expertise.index}`}>
          {expertise.scope.map((item) => (
            <SpecLabel key={item} as="li" rule>
              {item}
            </SpecLabel>
          ))}
        </Stack>
        <Stack gap="xs">
          <SpecLabel>Exemple</SpecLabel>
          <Text size="sm" tone="muted">
            {expertise.example}
          </Text>
        </Stack>
      </Stack>
    </BlueprintFrame>
  );
}
