"use client";

import { Container } from "@repo/ui/layout/container";
import { Grid } from "@repo/ui/layout/grid";
import { Stack } from "@repo/ui/layout/stack";
import { OperationRow } from "@repo/ui/mecanique/operation-row";
import { ScrollScene } from "@repo/ui/motion/scroll-scene";
import { useState } from "react";

import { heroChoreography } from "./hero-choreography";
import { HeroCopy } from "./hero-copy";
import { HeroFigure } from "./hero-figure";
import { operations } from "./operations";

export function HeroScene() {
  const [progress] = useState(() => ({ value: 0 }));
  return (
    <ScrollScene choreography={heroChoreography(progress)} length="long">
      <Container size="wide">
        <Grid columns="2" from="lg" gap="2xl" align="center" data-scene-item="hero-frame">
          <Stack gap="xl">
            <HeroCopy />
            <Stack as="ol" gap="none">
              {operations.map((operation, index) => (
                <OperationRow
                  key={operation.id}
                  data-scene-item={`operation-${index}`}
                  index={operation.index}
                  title={operation.title}
                  detail={operation.detail}
                  density="adaptive"
                />
              ))}
            </Stack>
          </Stack>
          <HeroFigure progress={progress} />
        </Grid>
      </Container>
    </ScrollScene>
  );
}
