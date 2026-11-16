import { MethodWheel } from "@repo/ui/agents/method-wheel";
import { Section } from "@repo/ui/layout/section";

import { agentsMethodFilm } from "./method-film";
import { MethodQuestion } from "./method-question";
import { agentsMethod } from "./method-steps";

/* The method as the home page's wheel: the question alone, then the ink stroke and its dots carry the paper from the
   handshake to the bridge to the bonsai, through 見 築 進. The Immersion phase carries the call to book it. */
export function MethodSection() {
  return (
    <Section id="methode" spacing="regular">
      <MethodWheel title={<MethodQuestion />} phases={agentsMethod} film={agentsMethodFilm} />
    </Section>
  );
}
