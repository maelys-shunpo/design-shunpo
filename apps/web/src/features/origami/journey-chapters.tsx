import { Chapter } from "@repo/ui/origami/chapter";
import { CreaseLegend } from "@repo/ui/origami/crease-legend";
import { Emphasis } from "@repo/ui/origami/emphasis";
import { ScopeList } from "@repo/ui/origami/scope-list";
import { Heading } from "@repo/ui/typography/heading";
import { Text } from "@repo/ui/typography/text";

import { moduleNames, type Step, steps } from "./chapters";
import { HeroChapter } from "./hero-chapter";
import { Still } from "./stills";

/* What a step adds under its text: the key of the pattern, the names of the modules. */
function StepDetail({ step }: { step: Step }) {
  if (step.id === "patron") {
    return <CreaseLegend label="Légende du patron" valley="Pli vallée" mountain="Pli montagne" />;
  }
  if (step.id === "modules") {
    return <ScopeList label="Les modules du cube" items={moduleNames} />;
  }
  return null;
}

/* Seven windows of scroll, one per step of building software: the need, the pattern, the base, the modules,
   the form, the launch, what follows. */
export function JourneyChapters() {
  return (
    <>
      <HeroChapter />
      {steps.map((step, order) => (
        <Chapter
          key={step.id}
          id={order === 0 ? "etapes" : undefined}
          index={step.index}
          still={<Still plate={step.plate} />}
          title={
            <Heading level={2}>
              {step.title} <Emphasis>{step.accent}</Emphasis>
            </Heading>
          }
        >
          <Text size="lg" tone="muted">
            {step.body}
          </Text>
          <StepDetail step={step} />
        </Chapter>
      ))}
    </>
  );
}
