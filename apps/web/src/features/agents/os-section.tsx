import { OsWindow } from "@repo/ui/agents/os-window";
import { PanScene } from "@repo/ui/agents/pan-scene";
import { PhotoStage } from "@repo/ui/agents/photo-stage";
import { Section } from "@repo/ui/layout/section";
import { Stack } from "@repo/ui/layout/stack";
import Image from "next/image";

import shoji from "./images/os-stage-shoji.webp";
import { osDecisions, osFallback, osLabels, osQuestions, osViews } from "./os-content";
import { OsLine, OsTitle } from "./os-copy";

/* The owner's single screen, set before a shōji screen at sunrise, the kumiko's shadow slanting across the washi: a prototype the visitor drives
   themselves, the figures fictitious and the window saying so. The section is held and travels sideways: the copy
   leaves to the left while the window comes in from the right and ends centred, in the proportions of a real window. */
export function OsSection() {
  return (
    <Section id="pilotage" spacing="flush">
      <PanScene
        lead={
          <Stack gap="lg" align="start">
            <OsTitle />
            <OsLine />
          </Stack>
        }
      >
        <PhotoStage
          padding="md"
          width="window"
          backdrop={<Image src={shoji} alt="" fill sizes="(min-width: 100rem) 100rem, 100vw" />}
        >
          <OsWindow
            views={osViews}
            decisions={osDecisions}
            questions={osQuestions}
            fallback={osFallback}
            labels={osLabels}
          />
        </PhotoStage>
      </PanScene>
    </Section>
  );
}
