"use client";

import { Container } from "@repo/ui/layout/container";
import { Grid } from "@repo/ui/layout/grid";
import { Stack } from "@repo/ui/layout/stack";
import { DimensionLine } from "@repo/ui/mecanique/dimension-line";
import { ScrollScene } from "@repo/ui/motion/scroll-scene";
import { Heading } from "@repo/ui/typography/heading";
import { Text } from "@repo/ui/typography/text";

import { conviction, method } from "../shunpo/content";
import { methodChoreography } from "./method-choreography";
import { SectionHeading } from "./section-heading";

export function MethodScene() {
  return (
    <ScrollScene choreography={methodChoreography} length="medium" minWidth="md">
      <Container size="wide">
        <Stack gap="3xl">
          <SectionHeading
            label="Gamme 04 · Méthode"
            title="Trois opérations, dans l’ordre."
            lead="On ne développe rien avant d’avoir compris. On ne livre rien que vos équipes ne savent pas utiliser."
          />
          <Grid as="ol" columns="3" from="md" gap="2xl" align="start">
            {method.map((step, index) => (
              <Stack as="li" key={step.id} gap="lg" data-scene-item={`step-${index}`}>
                <DimensionLine tone="signal" label={`Op. ${step.index}`} />
                <Heading level={3} size="title-sm" data-scene-item="step-body">
                  {step.title}
                </Heading>
                <Text tone="muted" data-scene-item="step-body">
                  {step.detail}
                </Text>
              </Stack>
            ))}
          </Grid>
          <Heading level={3} size="title" data-scene-item="conviction">
            {conviction}
          </Heading>
        </Stack>
      </Container>
    </ScrollScene>
  );
}
