import { Chip } from "@repo/ui/agents/chip";
import { Eyebrow } from "@repo/ui/agents/eyebrow";
import { Headline } from "@repo/ui/agents/headline";
import { Inline } from "@repo/ui/layout/inline";
import { Stack } from "@repo/ui/layout/stack";
import { Text } from "@repo/ui/typography/text";

import type { agentsMethod } from "./method-steps";

interface MethodPhaseProps {
  step: (typeof agentsMethod)[number];
  index: number;
}

/* One phase of the method: its name, what happens, and what the client receives. */
export function MethodPhase({ step, index }: MethodPhaseProps) {
  return (
    <Stack gap="sm" data-scene-item={`step-${String(index + 1)}`}>
      <Eyebrow tone={index === 0 ? "cobalt" : "ink"}>
        {index === 0 ? "Phase 01 · Le projet commence ici" : `Phase ${step.index}`}
      </Eyebrow>
      <Headline level={3} size="subtitle">
        {step.name}
      </Headline>
      <Text tone="muted" measure="prose">
        {step.detail}
      </Text>
      <Inline gap="xs" as="ul" aria-label={`Ce que livre la phase ${step.name}`}>
        {step.delivers.map((item) => (
          <li key={item}>
            <Chip render={<span />} size="sm" tone="quiet">
              {item}
            </Chip>
          </li>
        ))}
      </Inline>
    </Stack>
  );
}
