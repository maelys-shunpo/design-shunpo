"use client";

import { PairedLayers } from "@repo/ui/layout/paired-layers";
import { ScrollScene } from "@repo/ui/motion/scroll-scene";

import { AdoptBoard, AuditBoard, BuildBoard } from "./method-boards";
import { walkMethod } from "./method-choreography";
import { MethodPhase } from "./method-phase";
import { agentsMethod } from "./method-steps";

const boards = [<AuditBoard key="audit" />, <BuildBoard key="build" />, <AdoptBoard key="adopt" />];

/* Held from tablets up: the three steps on the left light in turn while the board on the right changes. */
export function MethodScene() {
  return (
    <ScrollScene choreography={walkMethod} length="long" minWidth="md">
      <PairedLayers
        items={agentsMethod.map((step, index) => ({
          id: step.id,
          aside: <MethodPhase step={step} index={index} />,
          panel: <div data-scene-item={`board-${String(index + 1)}`}>{boards[index]}</div>,
        }))}
      />
    </ScrollScene>
  );
}
