"use client";

import { Eyebrow } from "@repo/ui/agents/eyebrow";
import { Headline } from "@repo/ui/agents/headline";
import { PairedLayers } from "@repo/ui/layout/paired-layers";
import { Stack } from "@repo/ui/layout/stack";
import { ScrollScene } from "@repo/ui/motion/scroll-scene";
import { Text } from "@repo/ui/typography/text";

import { AdoptBoard, AuditBoard, BuildBoard } from "./method-boards";
import { walkMethod } from "./method-choreography";
import { agentsMethod } from "./method-steps";

const boards = [<AuditBoard key="audit" />, <BuildBoard key="build" />, <AdoptBoard key="adopt" />];

/* Held from tablets up: the three steps on the left light in turn while the board on the right changes. */
export function MethodScene() {
  return (
    <ScrollScene choreography={walkMethod} length="long" minWidth="md">
      <PairedLayers
        items={agentsMethod.map((step, index) => ({
          id: step.id,
          aside: (
            <Stack gap="sm" data-scene-item={`step-${String(index + 1)}`}>
              <Eyebrow tone={index === 1 ? "signal" : "ink"}>{`Étape ${step.index}`}</Eyebrow>
              <Headline level={3} size="subtitle">
                {step.title}
              </Headline>
              <Text tone="muted" measure="prose">
                {step.detail}
              </Text>
            </Stack>
          ),
          panel: <div data-scene-item={`board-${String(index + 1)}`}>{boards[index]}</div>,
        }))}
      />
    </ScrollScene>
  );
}
