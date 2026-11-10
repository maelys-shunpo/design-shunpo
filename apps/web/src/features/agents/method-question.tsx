import { Headline } from "@repo/ui/agents/headline";
import { InkWord } from "@repo/ui/agents/ink-word";

/* The method's question, alone on the paper before the wheel opens: the ink writes « Immersion » between its brackets. */
export function MethodQuestion() {
  return (
    <Headline level={2} size="title" align="center">
      Notre méthode&#8239;: chaque projet commence par une <InkWord>Immersion</InkWord>
    </Headline>
  );
}
